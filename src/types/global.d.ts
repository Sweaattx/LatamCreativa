/**
 * Global type declarations for the project
 */

// Extend framer-motion types to allow any children
import 'framer-motion';

declare module 'framer-motion' {
  export interface MotionProps {
    children?: React.ReactNode;
  }
}
