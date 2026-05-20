/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema
		.createTable('inspirational_quotes', function (table) {
			table.increments('id').primary();
			table.text('content').notNullable();
			table.string('mood_type').notNullable();
			table.integer('relevance_score').notNullable();
			table.text('context_summary');
			table.string('source').notNullable().defaultTo('openai');
			table.string('model');
			table.timestamps(true, true);
		})
		.alterTable('journal_entries', function (table) {
			table
				.integer('quote_id')
				.references('id')
				.inTable('inspirational_quotes');
		});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema
		.alterTable('journal_entries', function (table) {
			table.dropColumn('quote_id');
		})
		.dropTable('inspirational_quotes');
};
