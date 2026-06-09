
const db = require("../config/db");

exports.getFeed = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, content, is_published, created_at FROM notices WHERE is_published = true ORDER BY created_at DESC`,
    );
    res.status(200).json({ notices: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createNotice = async (req, res, next) => {
  try {
    const { title, content, target_role, is_published } = req.body;
    const authorId = req.user.id;

    let targetRoleId = null;
    if (target_role) {
      const roleRes = await db.query("SELECT id FROM roles WHERE name = $1", [
        target_role.toUpperCase(),
      ]);
      if (roleRes.rows.length > 0) targetRoleId = roleRes.rows[0].id;
    }

    const insertQuery = `
            INSERT INTO notices (title, content, author_id, target_role_id, is_published, created_at)
            VALUES ($1, $2, $3, $4, COALESCE($5, false), CURRENT_TIMESTAMP)
            RETURNING id, title, created_at`;

    const result = await db.query(insertQuery, [
      title,
      content,
      authorId,
      targetRoleId,
      is_published,
    ]);
    res.status(201).json({ message: "Notice created", notice: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, target_role, is_published } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const checkNotice = await db.query(
      "SELECT author_id FROM notices WHERE id = $1",
      [id],
    );
    if (checkNotice.rows.length === 0) {
      return res.status(404).json({ message: "Notice not found." });
    }

    if (userRole !== "ADMIN" && checkNotice.rows[0].author_id !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to modify this notice." });
    }

    let targetRoleId = null;
    if (target_role) {
      const roleRes = await db.query("SELECT id FROM roles WHERE name = $1", [
        target_role.toUpperCase(),
      ]);
      if (roleRes.rows.length > 0) targetRoleId = roleRes.rows[0].id;
    }

    const query = `
            UPDATE notices
            SET title = COALESCE($1, title),
                content = COALESCE($2, content),
                target_role_id = COALESCE($3, target_role_id),
                is_published = COALESCE($4, is_published),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 RETURNING id, title, updated_at`;

    const result = await db.query(query, [
      title,
      content,
      targetRoleId,
      is_published,
      id,
    ]);
    res
      .status(200)
      .json({ message: "Notice updated successfully", notice: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const checkNotice = await db.query(
      "SELECT author_id FROM notices WHERE id = $1",
      [id],
    );
    if (checkNotice.rows.length === 0) {
      return res.status(404).json({ message: "Notice not found." });
    }

    if (userRole !== "ADMIN" && checkNotice.rows[0].author_id !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this notice." });
    }

    await db.query("DELETE FROM notices WHERE id = $1", [id]);
    res.status(200).json({ message: "Notice deleted permanently." });
  } catch (error) {
    next(error);
  }
};
