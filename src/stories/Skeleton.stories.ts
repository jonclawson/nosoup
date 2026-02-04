import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import Skeleton from '@/components/Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Article: Story = {
    args: { type: 'article' },
};

export const Line: Story = {
   args: { type: 'line' },
};

export const Heading: Story = {
  args: { type: 'heading' },
};

export const Body: Story = {
  args: { type: 'body' },
};

export const Footer: Story = {
  args: { type: 'footer' },
};