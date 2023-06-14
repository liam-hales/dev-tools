import { FunctionComponent, ReactElement, Ref } from 'react';
import { Schema, z } from 'zod';
import { Feature } from './features';

/**
 * The feature ID used to differentiate
 * each individual feature
 */
export type FeatureId = '';

/**
 * The props that all component
 * props should `extends`
 *
 * - Generic type `T` for the `internalRef`
 *
 * The `internalRef` prop is used with the `withRef`
 * helper to forward component references
 *
 * @see [React - Forwarding Refs](https://reactjs.org/docs/forwarding-refs.html)
 */
export interface BaseProps<T extends HTMLElement = HTMLElement> {
  readonly internalRef?: Ref<T>;
  readonly className?: string;
}

/**
 * Like `FunctionComponent from `react` but for `async`
 * server components with a `Promise` return type
 *
 * - Generic type `T` for the props
 */
export interface AsyncComponent<T extends object = never> {
  (props: T): Promise<ReactElement<T>> | Promise<ReactElement>;
}

/**
 * Used to describe a feature that can
 * be used within the terminal
 *
 * - Generic type `F` for the feature ID
 * - Generic type `S` for the command schema
 * - Generic type `P` for the component props
 */
export interface IFeature<
  F extends FeatureId,
  S extends Schema,
  P extends object,
> {
  readonly id: F;
  readonly command: Command<S, P>;
  readonly component: FunctionComponent<P>;
  readonly enabled: boolean;
}

/**
 * Used to describe a feature command which
 * can be executed in the terminal
 *
 * - Generic type `S` for the schema
 * - Generic type `P` for the component props
 */
export interface Command<
  S extends Schema,
  P extends object,
> {
  readonly name: string;
  readonly options: CommandOptions<S>;
  readonly action: (options: z.infer<S>) => P;
}

/**
 * Used to describe the command options which consists of the `schema`
 * used for validation and a `config` for each option
 *
 * - Generic type `T` for the schema
 */
export interface CommandOptions<T extends Schema> {
  readonly schema: T;
  readonly config: Record<keyof z.infer<T>, CommandOptionConfig>;
}

/**
 * Used to describe the config
 * for a command option
 */
export interface CommandOptionConfig {
  readonly alias: string;
  readonly description: string;
}

/**
 * The utility type used to extract the feature `component`
 * props type for a specific feature
 *
 * - Generic type `T` for the feature ID
 */
export type ExtractProps<T extends FeatureId> =
  ReturnType<
    ExtractCommand<T>['action']
  >;

/**
 * The utility type used to extract the feature
 * `command` type for a specific feature
 *
 * - Generic type `T` for the feature ID
 */
export type ExtractCommand<T extends FeatureId> =
  Extract<
    Feature,
    {
      readonly id: T;
    }
  >['command'];

/**
 * Used to build the feature output
 * type for all features
 *
 * - Generic type `T` for the feature union type
 */
export type FeatureOutput<T extends Feature> =
  T extends Feature
    ? {
        readonly featureId: T['id'];
        readonly props: ExtractProps<T['id']>;
      }
    : never;

/**
 * Describes the parsed input which consists of
 * the `command` and the `options`
 */
export interface ParsedInput {
  readonly command?: string;
  readonly options?: Record<string, unknown>;
}

/**
 * Describes the terminal output block used
 * to store terminal output data
 */
export interface TerminalOutputBlock {
  readonly type: 'output';
  readonly input: string;
  readonly output: FeatureOutput<Feature>;
}

/**
 * Describes the terminal error block used
 * to store terminal error data
 */
export interface TerminalErrorBlock {
  readonly type: 'error';
  readonly input: string;
  readonly error: Error;
}

/**
 * The union type for all
 * terminal block types
 */
export type TerminalBlock = TerminalOutputBlock | TerminalErrorBlock;
