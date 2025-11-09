import { useEffect, useCallback, useRef } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

const usePrompt = (hasUnsavedChanges: boolean, message: string): void => {
  const onLocationChange = useCallback(() => {
    if (hasUnsavedChanges) {
      return !window.confirm(message);
    }
    return false;
  }, [hasUnsavedChanges]);

  Prompt(onLocationChange, hasUnsavedChanges);
  useBeforeUnload(
    useCallback(
      event => {
        if (hasUnsavedChanges) {
          event.preventDefault();
          event.returnValue = '';
        }
      },
      [hasUnsavedChanges]
    ),
    { capture: false }
  );
};

function Prompt(
  onLocationChange: () => boolean,
  hasUnsavedChanges: boolean
): void {
  const blocker = useBlocker(hasUnsavedChanges ? onLocationChange : false);
  const prevState = useRef(blocker.state);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    prevState.current = blocker.state;
  }, [blocker]);
}

export default usePrompt;
