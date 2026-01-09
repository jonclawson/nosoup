import ImageField from "@/components/ImageField";
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Components/ImageField",
  component: ImageField,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof ImageField>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    src: "https://picsum.photos/200",
    alt: "Random image from Picsum",
    className: "rounded-lg shadow-lg",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  },
};