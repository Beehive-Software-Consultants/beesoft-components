import { Meta, StoryObj } from '@storybook/react';
import { MediaQuery } from './media-query.component.tsx';

const meta: Meta<typeof MediaQuery> = {
  title: 'Mobile/Media Query',
  component: MediaQuery,
};

export default meta;

type Story = StoryObj<typeof MediaQuery>;

export const MobileOnly: Story = {
  args: {
    mobileMarkup: <div className="bsc-w-full">This is the mobile only markup</div>,
  },
};

export const MobileAndAbove: Story = {
  args: {
    mobileMarkup: <div className="bsc-w-full">This is the mobile only markup</div>,
    aboveMobileMarkup: <div className="bsc-w-full">This is for anything above mobile</div>,
  },
};

export const MobileTabletDesktop: Story = {
  args: {
    mobileMarkup: <div className="bsc-w-full">This is the mobile only markup</div>,
    tabletMarkup: <div className="bsc-w-full">This is the tablet only markup</div>,
    desktopMarkup: <div className="bsc-w-full">This is the desktop only markup</div>,
  },
};
