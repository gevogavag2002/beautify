import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  /** Content above the sheet (violet header). Scrolls together with the sheet. */
  header?: ReactNode;
  /** Fixed content below the scroll area (sticky footer with CTA). */
  footer?: ReactNode;
  /** Background of the whole screen (behind the header). */
  bg?: 'primary' | 'ground';
  /** Background and padding of the scrollable sheet. */
  sheet?: 'sheet' | 'ground';
  contentStyle?: ViewStyle;
  /** Overlap the sheet onto the header by this much (rounded top). */
  overlap?: number;
}>;

// Every form screen uses this: keyboard pushes the content up on both platforms,
// the whole screen (header included) scrolls when it no longer fits, bottom safe area
// is respected. Keyboard dismissal is left to the platform defaults (no custom taps/swipes).
export default function FormScreen({
  header,
  footer,
  bg = 'ground',
  sheet = 'sheet',
  contentStyle,
  overlap = 24,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      className={`flex-1 ${bg === 'primary' ? 'bg-primary' : 'bg-ground'}`}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {header}
        <View
          className={`flex-1 rounded-t-sheet ${sheet === 'sheet' ? 'bg-sheet' : 'bg-ground'}`}
          style={[
            header ? { marginTop: -overlap } : undefined,
            { paddingBottom: footer ? 16 : Math.max(insets.bottom, 16) },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </ScrollView>
      {footer && <View style={{ paddingBottom: insets.bottom }}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}
