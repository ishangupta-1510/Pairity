import { AccessibilityInfo, findNodeHandle } from 'react-native';
import { 
  AccessibilityTestResult, 
  AccessibilityViolation, 
  AccessibilityWarning,
  ContrastRatio,
  TouchTarget 
} from '@/types/testing';

export class AccessibilityTestRunner {
  private violations: AccessibilityViolation[] = [];
  private warnings: AccessibilityWarning[] = [];

  // Test accessibility properties of a component
  testComponent(component: any, componentName: string): AccessibilityTestResult {
    this.violations = [];
    this.warnings = [];

    this.checkAccessibilityLabel(component, componentName);
    this.checkAccessibilityRole(component, componentName);
    this.checkTouchTarget(component, componentName);
    this.checkFocusability(component, componentName);
    this.checkContrastRatio(component, componentName);
    this.checkScreenReaderSupport(component, componentName);

    const score = this.calculateAccessibilityScore();
    const passed = this.violations.length === 0;

    return {
      component: componentName,
      violations: this.violations,
      warnings: this.warnings,
      passed,
      score,
    };
  }

  private checkAccessibilityLabel(component: any, componentName: string): void {
    const props = component.props || {};
    
    // Interactive elements should have accessibility labels
    if (this.isInteractive(props.accessibilityRole)) {
      if (!props.accessibilityLabel && !props.children) {
        this.addViolation(
          'missing-label',
          'critical',
          `${componentName} is interactive but has no accessibility label`,
          componentName,
          'Add accessibilityLabel prop or ensure meaningful children text exists'
        );
      }
      
      if (props.accessibilityLabel && props.accessibilityLabel.length > 40) {
        this.addWarning(
          'long-label',
          `${componentName} has a very long accessibility label (${props.accessibilityLabel.length} characters)`,
          componentName,
          'Consider shortening the label to be more concise'
        );
      }
    }
  }

  private checkAccessibilityRole(component: any, componentName: string): void {
    const props = component.props || {};
    
    // Check if appropriate role is set
    if (props.onPress && !props.accessibilityRole) {
      this.addViolation(
        'missing-role',
        'serious',
        `${componentName} has onPress handler but no accessibilityRole`,
        componentName,
        'Add accessibilityRole="button" for pressable elements'
      );
    }

    // Check for appropriate role usage
    if (props.accessibilityRole === 'button' && !props.onPress) {
      this.addWarning(
        'inconsistent-role',
        `${componentName} has button role but no onPress handler`,
        componentName,
        'Ensure button role matches actual functionality'
      );
    }
  }

  private checkTouchTarget(component: any, componentName: string): boolean {
    const props = component.props || {};
    const style = this.flattenStyle(props.style);
    
    if (this.isInteractive(props.accessibilityRole)) {
      const touchTarget = this.calculateTouchTarget(style);
      
      if (!touchTarget.meetsGuidelines) {
        this.addViolation(
          'small-touch-target',
          'serious',
          `${componentName} touch target is too small (${touchTarget.width}x${touchTarget.height})`,
          componentName,
          'Ensure minimum touch target size of 44x44 points (iOS) or 48x48 dp (Android)'
        );
        return false;
      }
    }
    
    return true;
  }

  private checkFocusability(component: any, componentName: string): void {
    const props = component.props || {};
    
    // Interactive elements should be focusable
    if (this.isInteractive(props.accessibilityRole)) {
      if (props.accessible === false) {
        this.addViolation(
          'not-focusable',
          'critical',
          `${componentName} is interactive but not focusable (accessible=false)`,
          componentName,
          'Remove accessible=false or ensure element can receive focus'
        );
      }
    }
  }

  private checkContrastRatio(component: any, componentName: string): void {
    const props = component.props || {};
    const style = this.flattenStyle(props.style);
    
    if (style.color && style.backgroundColor) {
      const contrast = this.calculateContrastRatio(style.color, style.backgroundColor);
      
      if (contrast.level === 'FAIL') {
        this.addViolation(
          'insufficient-contrast',
          'serious',
          `${componentName} has insufficient color contrast ratio (${contrast.ratio})`,
          componentName,
          `Ensure contrast ratio meets WCAG ${contrast.largeText ? 'AA' : 'AAA'} standards`
        );
      } else if (contrast.level === 'AA' && !contrast.largeText) {
        this.addWarning(
          'contrast-warning',
          `${componentName} meets AA but not AAA contrast standards`,
          componentName,
          'Consider improving contrast for better accessibility'
        );
      }
    }
  }

  private checkScreenReaderSupport(component: any, componentName: string): void {
    const props = component.props || {};
    
    // Check for proper ARIA attributes
    if (props.accessibilityState && typeof props.accessibilityState !== 'object') {
      this.addViolation(
        'invalid-accessibility-state',
        'moderate',
        `${componentName} has invalid accessibilityState format`,
        componentName,
        'Ensure accessibilityState is an object with valid properties'
      );
    }
    
    // Check for live regions
    if (props.accessibilityLiveRegion && 
        !['none', 'polite', 'assertive'].includes(props.accessibilityLiveRegion)) {
      this.addViolation(
        'invalid-live-region',
        'moderate',
        `${componentName} has invalid accessibilityLiveRegion value`,
        componentName,
        'Use "none", "polite", or "assertive" for accessibilityLiveRegion'
      );
    }
  }

  // Test focus management
  async testFocusManagement(element: any): Promise<boolean> {
    try {
      const nodeHandle = findNodeHandle(element);
      if (nodeHandle) {
        await AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Focus management test failed:', error);
      return false;
    }
  }

  // Test screen reader announcements
  async testAnnouncement(message: string): Promise<boolean> {
    try {
      await AccessibilityInfo.announceForAccessibility(message);
      return true;
    } catch (error) {
      console.error('Announcement test failed:', error);
      return false;
    }
  }

  // Test keyboard navigation
  testKeyboardNavigation(component: any): boolean {
    const props = component.props || {};
    
    // Check if element is keyboard focusable
    if (this.isInteractive(props.accessibilityRole)) {
      return props.focusable !== false && props.accessible !== false;
    }
    
    return true;
  }

  // Helper methods
  private isInteractive(role?: string): boolean {
    const interactiveRoles = [
      'button',
      'link',
      'search',
      'switch',
      'tab',
      'tablist',
      'menuitem',
      'menubar',
      'slider',
    ];
    
    return interactiveRoles.includes(role || '');
  }

  private flattenStyle(style: any): any {
    if (!style) return {};
    
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.map(s => this.flattenStyle(s)));
    }
    
    if (typeof style === 'object') {
      return style;
    }
    
    return {};
  }

  private calculateTouchTarget(style: any): TouchTarget {
    const width = style.width || style.minWidth || 44;
    const height = style.height || style.minHeight || 44;
    
    // iOS: 44pt minimum, Android: 48dp minimum
    const minSize = 44; // Using iOS standard as baseline
    
    const meetsGuidelines = width >= minSize && height >= minSize;
    
    return {
      width,
      height,
      isAccessible: true,
      meetsGuidelines,
    };
  }

  private calculateContrastRatio(foreground: string, background: string): ContrastRatio {
    // Simplified contrast calculation
    // In production, use a proper color contrast library like 'contrast-ratio'
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    let level: 'AA' | 'AAA' | 'FAIL';
    const largeText = false; // This would need to be determined from font size
    
    if (ratio >= 7) {
      level = 'AAA';
    } else if (ratio >= 4.5) {
      level = 'AA';
    } else {
      level = 'FAIL';
    }
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      largeText,
    };
  }

  private getLuminance(color: string): number {
    // Convert hex color to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Apply gamma correction
    const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
  }

  private calculateAccessibilityScore(): number {
    const maxScore = 100;
    const criticalPenalty = 25;
    const seriousPenalty = 15;
    const moderatePenalty = 10;
    const minorPenalty = 5;
    
    let penalties = 0;
    
    this.violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          penalties += criticalPenalty;
          break;
        case 'serious':
          penalties += seriousPenalty;
          break;
        case 'moderate':
          penalties += moderatePenalty;
          break;
        case 'minor':
          penalties += minorPenalty;
          break;
      }
    });
    
    return Math.max(0, maxScore - penalties);
  }

  private addViolation(
    code: string,
    severity: 'critical' | 'serious' | 'moderate' | 'minor',
    message: string,
    element: string,
    suggestion: string
  ): void {
    this.violations.push({
      type: 'error',
      code,
      message,
      element,
      severity,
    });
  }

  private addWarning(
    code: string,
    message: string,
    element: string,
    suggestion?: string
  ): void {
    this.warnings.push({
      type: 'warning',
      code,
      message,
      element,
      suggestion,
    });
  }
}

// Accessibility Testing Utilities
export class AccessibilityTestUtils {
  private static testRunner = new AccessibilityTestRunner();

  // Test a single component
  static testComponent(component: any, name: string): AccessibilityTestResult {
    return this.testRunner.testComponent(component, name);
  }

  // Test multiple components
  static testComponents(components: { component: any; name: string }[]): AccessibilityTestResult[] {
    return components.map(({ component, name }) => 
      this.testRunner.testComponent(component, name)
    );
  }

  // Generate accessibility test report
  static generateReport(results: AccessibilityTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;
    
    let report = `Accessibility Test Report\n`;
    report += `========================\n\n`;
    report += `Summary:\n`;
    report += `- Total Components Tested: ${totalTests}\n`;
    report += `- Passed: ${passedTests}\n`;
    report += `- Failed: ${failedTests}\n`;
    report += `- Average Score: ${averageScore.toFixed(1)}/100\n`;
    report += `- Total Violations: ${totalViolations}\n`;
    report += `- Total Warnings: ${totalWarnings}\n\n`;
    
    // Failed tests details
    if (failedTests > 0) {
      report += `Failed Components:\n`;
      report += `==================\n`;
      
      results.filter(r => !r.passed).forEach(result => {
        report += `\n${result.component} (Score: ${result.score}/100)\n`;
        
        if (result.violations.length > 0) {
          report += `  Violations:\n`;
          result.violations.forEach(violation => {
            report += `    - [${violation.severity.toUpperCase()}] ${violation.message}\n`;
          });
        }
        
        if (result.warnings.length > 0) {
          report += `  Warnings:\n`;
          result.warnings.forEach(warning => {
            report += `    - ${warning.message}\n`;
          });
        }
      });
    }
    
    return report;
  }

  // Test screen reader compatibility
  static async testScreenReader(): Promise<boolean> {
    try {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      return isEnabled;
    } catch (error) {
      console.error('Screen reader test failed:', error);
      return false;
    }
  }

  // Test reduce motion preference
  static async testReduceMotion(): Promise<boolean> {
    try {
      const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      return isEnabled;
    } catch (error) {
      console.error('Reduce motion test failed:', error);
      return false;
    }
  }

  // Create accessibility test helpers for Jest
  static createTestHelpers() {
    return {
      expectAccessible: (component: any, name: string = 'Component') => {
        const result = this.testComponent(component, name);
        
        if (!result.passed) {
          const violations = result.violations.map(v => `${v.severity}: ${v.message}`).join('\n');
          throw new Error(`Accessibility test failed for ${name}:\n${violations}`);
        }
        
        return result;
      },
      
      expectMinimumScore: (component: any, minScore: number, name: string = 'Component') => {
        const result = this.testComponent(component, name);
        
        if (result.score < minScore) {
          throw new Error(`Accessibility score ${result.score} is below minimum ${minScore} for ${name}`);
        }
        
        return result;
      },
      
      expectTouchTarget: (component: any, name: string = 'Component') => {
        const result = this.testComponent(component, name);
        const touchTargetViolations = result.violations.filter(v => v.code === 'small-touch-target');
        
        if (touchTargetViolations.length > 0) {
          throw new Error(`Touch target too small for ${name}: ${touchTargetViolations[0].message}`);
        }
        
        return result;
      },
      
      expectContrastRatio: (component: any, name: string = 'Component') => {
        const result = this.testComponent(component, name);
        const contrastViolations = result.violations.filter(v => v.code === 'insufficient-contrast');
        
        if (contrastViolations.length > 0) {
          throw new Error(`Insufficient contrast for ${name}: ${contrastViolations[0].message}`);
        }
        
        return result;
      },
    };
  }
}

export default {
  AccessibilityTestRunner,
  AccessibilityTestUtils,
};