require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const pageId = process.env.NOTION_DATABASE_ID; // This is actually a page ID

async function setupDatabase() {
  console.log('Creating Laon TODO database...\n');

  // 1. Create database inside the page
  const db = await notion.databases.create({
    parent: { page_id: pageId },
    title: [{ text: { content: 'Laon TODO List' } }],
    properties: {
      Name: { title: {} },
      Status: {
        status: {
          options: [
            { name: 'Not started', color: 'default' },
            { name: 'In progress', color: 'blue' },
            { name: 'Done', color: 'green' },
          ],
        },
      },
      Priority: {
        select: {
          options: [
            { name: 'High', color: 'red' },
            { name: 'Medium', color: 'yellow' },
            { name: 'Low', color: 'green' },
          ],
        },
      },
      'Due Date': { date: {} },
      Tags: {
        multi_select: {
          options: [
            { name: 'work', color: 'blue' },
            { name: 'study', color: 'purple' },
            { name: 'health', color: 'green' },
            { name: 'daily', color: 'orange' },
          ],
        },
      },
    },
  });

  const databaseId = db.id;
  console.log(`Database created! ID: ${databaseId}\n`);

  // 2. Add sample data
  const sampleTodos = [
    { name: 'ADHD 관련 자료 정리', status: 'In progress', priority: 'High', tags: ['study'] },
    { name: '프로젝트 기획서 초안 작성', status: 'Not started', priority: 'High', tags: ['work'] },
    { name: '운동 30분 하기', status: 'Not started', priority: 'Medium', tags: ['health'] },
    { name: '장보기 목록 정리', status: 'Done', priority: 'Low', tags: ['daily'] },
    { name: '책 읽기 (30분)', status: 'Not started', priority: 'Medium', tags: ['study'] },
  ];

  for (const todo of sampleTodos) {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: todo.name } }] },
        Status: { status: { name: todo.status } },
        Priority: { select: { name: todo.priority } },
        Tags: { multi_select: todo.tags.map((t) => ({ name: t })) },
      },
    });
    console.log(`  ✅ ${todo.name}`);
  }

  console.log(`\n✨ Done! Update your .env:\nNOTION_DATABASE_ID=${databaseId}`);
}

setupDatabase().catch((err) => console.error('Error:', err.message));
