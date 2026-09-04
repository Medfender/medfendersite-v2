import type { Meta, StoryObj } from '@storybook/react';
import Turntable from './Turntable';
// Adjust this import path to wherever your actual AudioProvider is located
import { AudioProvider } from '@/context/AudioContext'; 

const meta: Meta<typeof Turntable> = {
  title: 'Components/Turntable',
  component: Turntable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AudioProvider>
        <Story />
      </AudioProvider>
    ),
  ],
  argTypes: {
    transportState: {
      control: { type: 'select' },
      options: ['playing', 'paused', 'stopped'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Turntable>;

export const Default: Story = {
  args: {
    transportState: 'stopped',
  },
};
