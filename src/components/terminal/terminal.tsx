'use client';

import { FunctionComponent, KeyboardEvent, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { BaseProps } from '../../types';
import { TerminalInput, TerminalErrorBlock, TerminalExecutedBlock } from '..';
import { useTerminal } from '../../hooks';

/**
 * The `Terminal` component props
 */
interface Props extends BaseProps {
  readonly children: ReactNode;
}

/**
 * Used to render the terminal user interface which
 * consists of the blocks and command input
 *
 * @param props The component props
 * @returns The `Terminal` component
 */
const Terminal: FunctionComponent<Props> = ({ children }): ReactElement<Props> => {
  const { blocks, inputHistory, isLoading, execute } = useTerminal();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  /**
   * Used to focus the `TerminalInput` when the
   * `inputValue` state changes to an empty string
   */
  useEffect(() => {

    // Only focus the input if the input
    // value state is an empty string
    if (inputValue === '') {
      inputRef.current?.focus();
    }
  }, [inputValue]);

  /**
   * Used to handle keyboard events from the `TerminalInput`
   * component underlying `input` HTML element
   *
   * @param event The keyboard event
   */
  const onKeyDown = async (event: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    const { key } = event;

    switch (key) {
      case 'Enter': {

        // If the input is empty, return to
        // avoid executing an empty input
        if (inputValue === '') {
          return;
        }

        // If the terminal is loading then return to avoid
        // executing the same command multiple times
        if (isLoading === true) {
          return;
        }

        // Call the `execute` function with
        // the user input from state
        await execute(inputValue);

        setInputValue('');
        setHistoryIndex(-1);

        break;
      }

      case 'ArrowUp': {
        // Prevent the default input behavior to
        // provent incorrect cursor position
        event.preventDefault();

        const index = historyIndex + 1;
        const input = inputHistory[index];

        if (index >= inputHistory.length) {
          return;
        }

        setHistoryIndex(index);
        setInputValue(input);

        break;
      }

      case 'ArrowDown': {
        const index = historyIndex - 1;
        const input = inputHistory[index] ?? '';

        if (index < -1) {
          return;
        }

        setHistoryIndex(index);
        setInputValue(input);

        break;
      }

      default: {
        break;
      }
    }
  };

  return (
    <>
      <div className="h-full flex flex-col-reverse pb-14 overflow-y-auto">
        {
          blocks.map((block) => {
            const { id, type, input, duration } = block;

            // For the error block render the
            // terminal error block component
            if (type === 'error') {
              return (
                <TerminalErrorBlock
                  key={`error-block-${id}`}
                  input={input}
                  duration={duration}
                  error={block.error}
                />
              );
            }

            // For the executed block render the
            // terminal executed block component
            return (
              <TerminalExecutedBlock
                key={`executed-block-${id}`}
                input={input}
                duration={duration}
                output={block.output}
              />
            );
          })
        }
        {children}
      </div>
      <TerminalInput
        ref={inputRef}
        value={inputValue}
        isLoading={isLoading}
        isDisabled={isLoading}
        onChange={setInputValue}
        onKeyDown={onKeyDown}
      />
    </>
  );
};

export default Terminal;
