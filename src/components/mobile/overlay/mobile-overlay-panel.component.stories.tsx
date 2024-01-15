import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../navigation/buttons/button/button.component.tsx';
import { MobileOverlayPanel } from './mobile-overlay-panel.component.tsx';
import { MobileOverlayPanelProps } from './mobile-overlay-panel.props.ts';

const meta: Meta<typeof MobileOverlayPanel> = {
  title: 'Mobile/Overlay Panel',
  component: MobileOverlayPanel,
};

export default meta;

type Story = StoryObj<typeof MobileOverlayPanel>;

const Template = (args: Omit<MobileOverlayPanelProps, 'children'>) => {
  const [visible, setVisible] = useState(false);

  const showOverlay = () => setVisible(true);

  return (
    <>
      <Button onClick={() => showOverlay()}>Show Overlay</Button>
      <MobileOverlayPanel {...args} visible={visible} hidden={() => setVisible(false)}>
        <>This is some test content</>
      </MobileOverlayPanel>
    </>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
};
