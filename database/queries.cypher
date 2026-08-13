// Query 1 — Role recommendations
// Given a user and their current skills, calculate how many skills each role requires and how many of those skills the user already has.
// Return roles ordered by match percentage.
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
ORDER BY matchPercent DESC;

// Query 2 — Multi-hop career discovery
// Traverses two or more relationship hops from the user's current skills to related skills and then to roles.
MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)
MATCH (s)-[:RELATED_TO*1..2]->(related:Skill)
MATCH (r:Role)-[:REQUIRES]->(related)
RETURN DISTINCT
 r.id AS id,
 r.title AS role,
 r.level AS level,
 related.name AS reachableSkill
ORDER BY role;

// Query 3 — Skill gaps
// Finds the skills required for a role that the user does not currently have.
MATCH (u:User {id: $userId})-[:HAS_SKILL]->(owned:Skill)
WITH collect(owned.id) AS ownedIds
MATCH (r:Role {id: $roleId})-[:REQUIRES]->(required:Skill)
WHERE NOT required.id IN ownedIds
RETURN required.id AS id,
 required.name AS name,
 required.category AS category
ORDER BY required.category, required.name;

// Query 4 — Learning resources for missing skills
// Recommends courses, tutorials, or books connected to the skills required for a role.
MATCH (r:Role {id: $roleId})-[:REQUIRES]->(s:Skill)
<-[:TEACHES]-(res:Resource)
RETURN s.name AS skill,
 res.title AS resource,
 res.type AS type,
 res.url AS url;

// Query 5 — Shortest Path Career Path
// Finds the shortest path of RELATED_TO relationships between the user's owned skills and the target role's required skills.
MATCH (u:User {id: $userId})-[:HAS_SKILL]->(owned:Skill)
MATCH (r:Role {id: $roleId})-[:REQUIRES]->(req:Skill)
MATCH p = shortestPath((owned)-[:RELATED_TO*0..5]->(req))
RETURN p, owned, req;
