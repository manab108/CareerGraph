const { runQuery } = require('../config/database');

// Helper to safely convert Neo4j integers / floats to JavaScript numbers
const toNum = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'object' && val.toNumber) {
    return val.toNumber();
  }
  return Number(val);
};

// GET /api/health
exports.getHealth = async (req, res) => {
  try {
    await runQuery("RETURN 1");
    res.json({ status: "OK", database: "Connected" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ status: "ERROR", message: "Database connection failed", error: error.message });
  }
};

// GET /api/skills
exports.getSkills = async (req, res) => {
  try {
    const result = await runQuery(`
      MATCH (s:Skill) 
      RETURN s.id AS id, s.name AS name, s.category AS category 
      ORDER BY s.category, s.name
    `);
    const skills = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      category: record.get('category')
    }));
    res.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error.message);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
};

// GET /api/recommendations/:userId
exports.getRecommendations = async (req, res) => {
  const { userId } = req.params;
  try {
    
    const userCheck = await runQuery("MATCH (u:User {id: $userId}) RETURN u.name AS name", { userId });
    if (userCheck.records.length === 0) {
      return res.status(404).json({ error: `User "${userId}" not found` });
    }
    const userName = userCheck.records[0].get('name');

    
    const query = `
      MATCH (u:User {id: $userId})-[:HAS_SKILL]->(owned:Skill)
      WITH u, collect(owned.id) AS ownedIds
      MATCH (r:Role)-[:REQUIRES]->(required:Skill)
      WITH r, ownedIds,
           count(required) AS total,
           sum(CASE WHEN required.id IN ownedIds THEN 1 ELSE 0 END) AS matched
      RETURN r.id AS id,
             r.title AS title,
             r.level AS level,
             total,
             matched,
             CASE WHEN total = 0 THEN 0
             ELSE round((100.0 * matched) / total) END AS matchPercent
      ORDER BY matchPercent DESC
    `;
    const result = await runQuery(query, { userId });
    const recommendations = result.records.map(record => ({
      id: record.get('id'),
      title: record.get('title'),
      level: record.get('level'),
      total: toNum(record.get('total')),
      matched: toNum(record.get('matched')),
      matchPercent: toNum(record.get('matchPercent'))
    }));
    
    res.json({ userName, recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error.message);
    res.status(500).json({ error: "Failed to calculate recommendations" });
  }
};

// GET /api/roles/:roleId
exports.getRole = async (req, res) => {
  const { roleId } = req.params;
  try {
    const query = `
      MATCH (r:Role {id: $roleId})
      OPTIONAL MATCH (c:Company)-[:OFFERS]->(r)
      RETURN r.id AS id, r.title AS title, r.level AS level, collect(c.name) AS companies
    `;
    const result = await runQuery(query, { roleId });
    if (result.records.length === 0) {
      return res.status(404).json({ error: `Role "${roleId}" not found` });
    }
    const record = result.records[0];
    res.json({
      id: record.get('id'),
      title: record.get('title'),
      level: record.get('level'),
      companies: record.get('companies')
    });
  } catch (error) {
    console.error("Error fetching role details:", error.message);
    res.status(500).json({ error: "Failed to fetch role details" });
  }
};

// GET /api/roles/:roleId/gaps/:userId
exports.getRoleGaps = async (req, res) => {
  const { roleId, userId } = req.params;
  try {
    const query = `
      MATCH (r:Role {id: $roleId})-[:REQUIRES]->(required:Skill)
      OPTIONAL MATCH (u:User {id: $userId})-[h:HAS_SKILL]->(required)
      RETURN required.id AS id,
             required.name AS name,
             required.category AS category,
             h IS NOT NULL AS isOwned
      ORDER BY required.category, required.name
    `;
    const result = await runQuery(query, { roleId, userId });
    
    const matched = [];
    const missing = [];
    
    result.records.forEach(record => {
      const skill = {
        id: record.get('id'),
        name: record.get('name'),
        category: record.get('category')
      };
      if (record.get('isOwned')) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    res.json({ matched, missing });
  } catch (error) {
    console.error("Error calculating skill gaps:", error.message);
    res.status(500).json({ error: "Failed to calculate skill gaps" });
  }
};

// GET /api/roles/:roleId/resources
exports.getRoleResources = async (req, res) => {
  const { roleId } = req.params;
  try {
    const query = `
      MATCH (r:Role {id: $roleId})-[:REQUIRES]->(s:Skill)
      MATCH (res:Resource)-[:TEACHES]->(s)
      RETURN s.id AS skillId,
             s.name AS skillName,
             res.id AS resourceId,
             res.title AS title,
             res.type AS type,
             res.url AS url
      ORDER BY s.name, res.title
    `;
    const result = await runQuery(query, { roleId });
    const resources = result.records.map(record => ({
      skillId: record.get('skillId'),
      skillName: record.get('skillName'),
      id: record.get('resourceId'),
      title: record.get('title'),
      type: record.get('type'),
      url: record.get('url')
    }));
    res.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error.message);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
};

// GET /api/career-path/:userId/:roleId
exports.getCareerPath = async (req, res) => {
  const { userId, roleId } = req.params;
  try {
    // 1. Get all skills owned by the user
    const ownedResult = await runQuery(`
      MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)
      RETURN collect(s.id) AS ownedIds
    `, { userId });
    
    const ownedIds = ownedResult.records.length > 0 
      ? ownedResult.records[0].get('ownedIds') 
      : [];

    // 2. Query to find shortest path from owned skill to missing required skill
    const pathQuery = `
      MATCH (u:User {id: $userId})
      MATCH (u)-[:HAS_SKILL]->(owned:Skill)
      MATCH (r:Role {id: $roleId})-[:REQUIRES]->(req:Skill)
      WHERE NOT (u)-[:HAS_SKILL]->(req)
      MATCH p = shortestPath((owned)-[:RELATED_TO*0..5]->(req))
      RETURN [n IN nodes(p) | {id: n.id, name: n.name, category: n.category}] AS skillNodes,
             length(p) AS len
      ORDER BY len DESC
      LIMIT 1
    `;
    const pathResult = await runQuery(pathQuery, { userId, roleId });

    let paths = [];
    if (pathResult.records.length > 0) {
      paths = pathResult.records.map(record => {
        const nodes = record.get('skillNodes');
        const pathWithOwnership = nodes.map(node => ({
          ...node,
          isOwned: ownedIds.includes(node.id)
        }));
        return {
          length: record.get('len').toNumber(),
          skills: pathWithOwnership
        };
      });
    } else {
      // Fallback: If no related path exists to a missing skill, just return the list of required skills
      const fallbackQuery = `
        MATCH (r:Role {id: $roleId})-[:REQUIRES]->(req:Skill)
        RETURN req.id AS id, req.name AS name, req.category AS category
      `;
      const fallbackResult = await runQuery(fallbackQuery, { roleId });
      const skills = fallbackResult.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        category: record.get('category'),
        isOwned: ownedIds.includes(record.get('id'))
      }));
      paths = [{
        length: skills.length,
        skills: skills
      }];
    }

    res.json({
      roleId,
      path: paths[0] || { length: 0, skills: [] }
    });
  } catch (error) {
    console.error("Error generating career path:", error.message);
    res.status(500).json({ error: "Failed to generate career path" });
  }
};

// GET /api/users/:userId/skills
exports.getUserSkills = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await runQuery(`
      MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)
      RETURN s.id AS id, s.name AS name, s.category AS category
      ORDER BY s.category, s.name
    `, { userId });
    const skills = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      category: record.get('category')
    }));
    res.json(skills);
  } catch (error) {
    console.error("Error fetching user skills:", error.message);
    res.status(500).json({ error: "Failed to fetch user skills" });
  }
};

// POST /api/users/:userId/skills/:skillId
exports.addUserSkill = async (req, res) => {
  const { userId, skillId } = req.params;
  try {
    await runQuery(`
      MATCH (u:User {id: $userId}), (s:Skill {id: $skillId})
      MERGE (u)-[:HAS_SKILL]->(s)
    `, { userId, skillId });
    res.json({ success: true, message: "Skill added successfully" });
  } catch (error) {
    console.error("Error adding user skill:", error.message);
    res.status(500).json({ error: "Failed to add user skill" });
  }
};

// DELETE /api/users/:userId/skills/:skillId
exports.removeUserSkill = async (req, res) => {
  const { userId, skillId } = req.params;
  try {
    await runQuery(`
      MATCH (u:User {id: $userId})-[h:HAS_SKILL]->(s:Skill {id: $skillId})
      DELETE h
    `, { userId, skillId });
    res.json({ success: true, message: "Skill removed successfully" });
  } catch (error) {
    console.error("Error removing user skill:", error.message);
    res.status(500).json({ error: "Failed to remove user skill" });
  }
};

