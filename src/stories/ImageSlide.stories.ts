import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import ImageSlide from '../components/ImageSlide';

const meta = {
  title: 'Components/ImageSlide',
  component: ImageSlide,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  args: {
    images: [
      { value: 'https://picsum.photos/600/400?text=Image+1' },
      { value: 'https://picsum.photos/600/400?text=Image+2' },
      { value: 'https://picsum.photos/600/400?text=Image+3' },
    ],
  },
} satisfies Meta<typeof ImageSlide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // uses defaults from meta
  },
};

export const SingleImage: Story = {
  args: {
    images: [
      { value: 'https://via.placeholder.com/600x400?text=Only+Image' },
    ],
  },
};

export const NoImages: Story = {
  args: {
    images: [],
  },
};