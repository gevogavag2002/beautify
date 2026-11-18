import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { BackHandler, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';

import Icon from './Icon';
import { SheetInputContext } from './sheetContext';
import Text from './Text';

type Props = PropsWithChildren<{
  open: boolean;
  /** Title row with the close button. Leave out for a bare sheet (confirmation dialogs). */
  title?: string;
  onClose: () => void;
}>;

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.55}
    style={[props.style, { backgroundColor: colors.ink }]}
  />
);

const Handle = () => (
  <View style={{ alignItems: 'center', paddingTop: 10 }}>
    <View className="rounded-pill bg-hairline" style={{ width: 40, height: 5 }} />
  </View>
);

// Bottom sheet from the canvas on top of @gorhom/bottom-sheet: grows to its content (max
// 92% of the screen), drags with a finger, swipe down / backdrop tap / Android back closes
// it, follows the keyboard. Title row with a round close button, content gap 14.
//
// `open` is the single source of truth. The library is imperative, so this component keeps
// its own record of what it asked for:
// - `dismiss()` is only called on a sheet we presented. Calling it on an idle modal leaves the
//   library stuck in DISMISSING and the next `present()` renders nothing.
// - Reopening while the close animation runs is queued and replayed in `onDismiss`.
// - Children stay mounted until the close animation ends (no height collapse mid-swipe) and
//   are unmounted after, so form state starts fresh on every open.
export default function Sheet({ open, title, onClose, children }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const ref = useRef<BottomSheetModal>(null);
  const presented = useRef(false);
  const closing = useRef(false);
  const openRef = useRef(open);
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    openRef.current = open;
    if (open && !presented.current) {
      presented.current = true;
      ref.current?.present();
    } else if (!open && presented.current && !closing.current) {
      closing.current = true;
      ref.current?.dismiss();
    }
  }, [open]);

  // Fired once the sheet is fully gone, whoever closed it (us, swipe, backdrop).
  const handleDismiss = () => {
    const reopen = closing.current && openRef.current;
    presented.current = false;
    closing.current = false;
    if (reopen) {
      presented.current = true;
      ref.current?.present();
      return;
    }
    setMounted(false);
    if (openRef.current) onClose();
  };

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.92}
      enablePanDownToClose
      onDismiss={handleDismiss}
      topInset={insets.top}
      backdropComponent={Backdrop}
      handleComponent={Handle}
      backgroundStyle={{ backgroundColor: colors.sheet, borderRadius: 28 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <SheetInputContext.Provider value={BottomSheetTextInput}>
        <BottomSheetScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingTop: title != null ? 4 : 14,
            paddingHorizontal: 20,
            paddingBottom: Math.max(insets.bottom, 26),
            gap: 14,
          }}
        >
          {title != null ? (
            <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
              <Text weight={800} className="flex-1 text-[21px] leading-[27px] text-ink">
                {title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={onClose}
                className="items-center justify-center rounded-full bg-ground"
                style={{ width: 44, height: 44, flexShrink: 0 }}
              >
                <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2.6} />
              </Pressable>
            </View>
          ) : null}
          {mounted ? children : null}
        </BottomSheetScrollView>
      </SheetInputContext.Provider>
    </BottomSheetModal>
  );
}
