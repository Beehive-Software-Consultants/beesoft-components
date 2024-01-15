import { useMediaQuery } from '@react-hook/media-query';
import { MediaQueryProps } from './media-query.props.ts';

const MediaQuery = ({
  mobileQuery = 'screen and (max-device-width: 40rem)',
  tabletQuery = 'screen and (min-device-width: 40.01rem) and (max-device-width: 63.9375rem)',
  desktopQuery = 'screen and (min-device-width: 64rem)',
  mobileMarkup,
  aboveMobileMarkup,
  tabletMarkup,
  desktopMarkup,
}: MediaQueryProps) => {
  const isMobile = useMediaQuery(mobileQuery);
  const isTablet = useMediaQuery(tabletQuery);
  const isDesktop = useMediaQuery(desktopQuery);

  const renderCorrectMarkup = () => {
    if (isMobile && mobileMarkup) {
      return mobileMarkup;
    } else if (!isMobile && aboveMobileMarkup) {
      return aboveMobileMarkup;
    } else if (isTablet && tabletMarkup) {
      return tabletMarkup;
    } else if (isDesktop && desktopMarkup) {
      return desktopMarkup;
    } else {
      console.error('Invalid media settings');
      return null;
    }
  };

  return renderCorrectMarkup();
};

export { MediaQuery };
