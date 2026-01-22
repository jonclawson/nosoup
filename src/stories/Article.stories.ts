import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import ArticleView from '../components/ArticleView';
import type { Article } from '@/lib/types';

const meta = {
  title: 'Components/ArticleView',
  component: ArticleView,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  args: {
    article: {
      title: 'Sample Article Title',
      body: '<p>This is a sample article body with <strong>HTML</strong> content.</p>',
      fields: [],
      author: { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'user' },
    },
  },
} satisfies Meta<typeof ArticleView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // uses defaults from meta
  },
};

export const WithImage: Story = {
  args: {
    article: {
      fields: [{ id: 'img1', type: 'image', value: 'https://picsum.photos/600/400?text=Article+Image' }],
      title: 'Sample Article with Image',
      body: '<p>This article includes an image field.</p>',
      author: { id: '1', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user' },
    },
  },
};
export const WithImages: Story = {
  args: {
    article: {
      fields: [
        { id: 'img1', type: 'image', value: 'https://picsum.photos/600/400?text=Article+Image+1' },
        { id: 'img2', type: 'image', value: 'https://picsum.photos/600/400?text=Article+Image+2' },
        { id: 'img2', type: 'image', value: 'https://picsum.photos/600/400?text=Article+Image+3' },
        { id: 'img2', type: 'image', value: 'https://picsum.photos/600/400?text=Article+Image+4' },
      ],
      title: 'Sample Article with Multiple Images',
      body: '<p>This article includes multiple image fields.</p>',
      author: { id: '1', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user' },
    },
  },
};
export const WithCodeField: Story = {
  args: {
    article: {
      fields: [{ id: 'code1', type: 'code', value: 'console.log("Hello, world!");' }],
      title: 'Sample Article with Code Field',
      body: '<p>This article includes a code field.</p>',
      author: { id: '2', name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'user' },
    },
  },
};
export const PublishedArticle: Story = {
  args: {
    article: {
      title: 'Published Article',
      body: '<p>This is a published article.</p>',
      fields: [],
      published: true,
      author: { id: '2', name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'user' },
    },
  },
};
export const DraftArticle: Story = {
  args: {
    article: {
      title: 'Draft Article',
      body: '<p>This is a draft article.</p>',
      fields: [],
      published: false,
      author: { id: '3', name: 'Bob Brown', email: 'bob.brown@example.com', role: 'user' },
    },
  },
};
export const WithTags: Story = {
  args: {
    article: {
      title: 'Article with Tags',
      body: '<p>This article has multiple tags associated with it.</p>',
      fields: [],
      tags: [{ id: 'tag1', name: 'Tech' }, { id: 'tag2', name: 'News' }],
      author: { id: '4', name: 'Charlie Davis', email: 'charlie.davis@example.com', role: 'user' },
    },
  },
};
