import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import DeleteButton from '../components/DeleteButton';

const meta = {
  title: 'Components/DeleteButton',
  component: DeleteButton,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  args: {
    userId: '123',
    onDelete: fn(),
    children: 'Delete',
    resourceType: 'user',
  },
} satisfies Meta<typeof DeleteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserDelete: Story = {
  args: {
    // uses defaults from meta
  },
};

export const ArticleDelete: Story = {
  args: {
    resourceType: 'article',
    children: 'Delete article',
  },
};

export const CustomClass: Story = {
  args: {
    className: 'text-blue-600 hover:text-blue-900',
    children: 'Remove',
  },
};
