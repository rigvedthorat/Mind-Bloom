/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	await knex.raw(`
		WITH duplicate_usernames AS (
			SELECT
				id,
				username,
				ROW_NUMBER() OVER (PARTITION BY username ORDER BY id) AS duplicate_rank
			FROM users
		)
		UPDATE users
		SET username = users.username || '_' || users.id
		FROM duplicate_usernames
		WHERE users.id = duplicate_usernames.id
			AND duplicate_usernames.duplicate_rank > 1
	`);

	return knex.schema.alterTable('users', function (table) {
		table.unique('username', { indexName: 'users_username_unique' });
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.alterTable('users', function (table) {
		table.dropUnique(['username'], 'users_username_unique');
	});
};
