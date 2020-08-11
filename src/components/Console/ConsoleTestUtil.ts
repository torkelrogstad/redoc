import * as yaml from 'yaml-js';
import * as path from 'path';
import { readFileSync } from 'fs';
import * as rtl from '@testing-library/react';
// eslint-disable-next-line import/no-internal-modules
import { IAceEditor } from 'react-ace/lib/types';

import {
  SpecStore,
  OperationModel,
  ContentItemModel,
  RedocNormalizedOptions,
} from '../../services';

const getAllOperations = (items: ContentItemModel[]): ContentItemModel[] => {
  if (items.length === 0) {
    return [];
  }

  return items
    .concat(...items.map((item) => getAllOperations(item.items)))
    .filter((item) => item instanceof OperationModel);
};

export const findOperation = (id: string, spec: SpecStore): OperationModel => {
  const operations = getAllOperations(spec.contentItems);
  const op = operations.find((item) => item.id === `operation/${id}`);
  if (!op) {
    fail(`could not find operation with ID ${id}`);
  }
  expect(op).toBeInstanceOf(OperationModel);
  return op as OperationModel;
};

export const getSpec = (
  filename: string,
  options: RedocNormalizedOptions = new RedocNormalizedOptions({}),
): SpecStore => {
  const spec = readFileSync(path.join(__filename, '..', '..', '..', '..', 'demo', filename));
  return new SpecStore(yaml.load(spec), undefined, options);
};

export const getAceEditor = (utils: rtl.RenderResult): IAceEditor => {
  const textarea = utils.getByRole('textbox');
  const fiberKey = Object.keys(textarea.parentElement!).find((key) =>
    key.startsWith('__reactInternalInstance$'),
  );
  const fiber = textarea.parentElement![fiberKey!];
  expect(fiber).not.toBeNull();

  const editor = fiber.stateNode.env.editor as IAceEditor;
  expect(editor).toBeDefined();
  return editor;
};
