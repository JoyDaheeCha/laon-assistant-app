require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

const sampleTodos = [
  { name: 'ADHD 관련 자료 정리', status: 'In progress', priority: 'High', tags: ['study'] },
  { name: '프로젝트 기획서 초안 작성', status: 'Not started', priority: 'High', tags: ['work'] },
  { name: '운동 30분 하기', status: 'Not started', priority: 'Medium', tags: ['health'] },
  { name: '장보기 목록 정리', status: 'Done', priority: 'Low', tags: ['daily'] },
  { name: '책 읽기 (30분)', status: 'Not started', priority: 'Medium', tags: ['study'] },
];

async function createSampleData() {
  console.log('Creating sample TODO data...\n');

  for (const todo of sampleTodos) {
    try {
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
    } catch (err) {
      console.error(`  ❌ ${todo.name}: ${err.message}`);
    }
  }

  console.log('\nDone! Check your Notion database.');
}

createSampleData();
