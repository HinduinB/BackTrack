import { theme } from '../../theme';

export interface CodeBlockProps {
  content: string;
  maxHeight?: string;
  color?: string;
}

export function CodeBlock({ content, maxHeight = '120px', color }: CodeBlockProps) {
  return (
    <pre
      style={{
        margin: 0,
        color: color || theme.colors.text.primary,
        background: theme.colors.background.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.monoFamily,
        maxHeight,
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
      }}
    >
      {content}
    </pre>
  );
} 