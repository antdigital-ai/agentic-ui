import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MarkdownInputField } from '../MarkdownInputField';
import * as AttachmentUtils from '../AttachmentButton/utils';

// Mock BaseMarkdownEditor to avoid complex slate initialization but we need to ensure refs work.
// Actually, using the real component seems to work in other tests, but let's check if we need to mock isMobileDevice.

describe('MarkdownInputField - Keyboard Shortcuts', () => {
  const onSend = vi.fn();
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to not mobile
    vi.spyOn(AttachmentUtils, 'isMobileDevice').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setup = (props = {}) => {
    return render(
      <MarkdownInputField
        value="test message"
        onSend={onSend}
        onChange={onChange}
        {...props}
      />,
    );
  };

  describe('Mode: Enter (Default)', () => {
    it('should send on Enter', () => {
      setup({ triggerSendKey: 'Enter' });
      
      const wrapper = document.querySelector('.ant-agentic-md-input-field');
      if (!wrapper) throw new Error('Wrapper not found');

      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      expect(onSend).toHaveBeenCalledTimes(1);
    });

    it('should not send on Shift+Enter', () => {
      setup({ triggerSendKey: 'Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
      
      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not send on Ctrl+Enter', () => {
      setup({ triggerSendKey: 'Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13, ctrlKey: true });
      
      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('Mode: Mod+Enter', () => {
    it('should send on Ctrl+Enter', () => {
      setup({ triggerSendKey: 'Mod+Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13, ctrlKey: true });
      
      expect(onSend).toHaveBeenCalledTimes(1);
    });

    it('should send on Cmd+Enter (Meta)', () => {
      setup({ triggerSendKey: 'Mod+Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13, metaKey: true });
      
      expect(onSend).toHaveBeenCalledTimes(1);
    });

    it('should not send on plain Enter', () => {
      setup({ triggerSendKey: 'Mod+Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not send on Mod+Shift+Enter', () => {
      setup({ triggerSendKey: 'Mod+Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      fireEvent.keyDown(wrapper, { 
        key: 'Enter', 
        code: 'Enter', 
        charCode: 13, 
        ctrlKey: true,
        shiftKey: true 
      });
      
      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Device Override', () => {
    it('should force Mod+Enter mode on mobile even if configured as Enter', () => {
      vi.spyOn(AttachmentUtils, 'isMobileDevice').mockReturnValue(true);
      
      // Configure as 'Enter' mode
      setup({ triggerSendKey: 'Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      // Try plain Enter - should NOT send (because forced to Mod+Enter mode)
      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13 });
      expect(onSend).not.toHaveBeenCalled();

      // Try Mod+Enter - SHOULD send
      fireEvent.keyDown(wrapper, { key: 'Enter', code: 'Enter', charCode: 13, ctrlKey: true });
      expect(onSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('Composition Handling', () => {
    it('should not send when composing (using isComposing property)', () => {
      setup({ triggerSendKey: 'Enter' });
      const wrapper = document.querySelector('.ant-agentic-md-input-field')!;

      // Simulate composition event properties
      // Note: nativeEvent must have isComposing: true
      
      // Override isComposing on the event object because KeyboardEventInit might not set it on all environments/browsers perfectly in jsdom?
      // Actually React synthesizes events. fireEvent creates synthetic events.
      // We can pass `isComposing: true` to fireEvent options.
      
      fireEvent.keyDown(wrapper, { 
        key: 'Enter', 
        code: 'Enter', 
        charCode: 13,
        isComposing: true,
        // Also simulate nativeEvent
        nativeEvent: { isComposing: true }
      });
      
      expect(onSend).not.toHaveBeenCalled();
    });
  });
});
