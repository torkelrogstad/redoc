import * as rtl from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import * as path from 'path';
import * as yaml from 'yaml-js';
import { ConsoleViewer } from './ConsoleViewer';
import {
  SpecStore,
  RedocNormalizedOptions,
  OperationModel,
  ContentItemModel,
} from '../../services';
import { readFileSync } from 'fs';
import { ThemeProvider } from 'styled-components';
import { waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
// eslint-disable-next-line import/no-internal-modules
import { IAceEditor } from 'react-ace/lib/types';
import { act } from 'react-dom/test-utils';

const getAllOperations = (items: ContentItemModel[]): ContentItemModel[] => {
  if (items.length === 0) {
    return [];
  }

  return items
    .concat(...items.map((item) => getAllOperations(item.items)))
    .filter((item) => item instanceof OperationModel);
};

const findOperation = (id: string, spec: SpecStore): OperationModel => {
  const operations = getAllOperations(spec.contentItems);
  const op = operations.find((item) => item.id === `operation/${id}`);
  if (!op) {
    fail(`could not find operation with ID ${id}`);
  }
  expect(op).toBeInstanceOf(OperationModel);
  return op as OperationModel;
};

const setup = (operationId: string) => {
  const options = new RedocNormalizedOptions({});
  const spec = readFileSync(path.join(__filename, '..', '..', '..', '..', 'demo', 'openapi.yaml'));
  const specStore = new SpecStore(yaml.load(spec), undefined, options);

  return rtl.render(
    <ThemeProvider theme={options.theme}>
      <ConsoleViewer
        securitySchemes={specStore.securitySchemes}
        urlIndex={0}
        operation={findOperation(operationId, specStore)}
      />
    </ThemeProvider>,
  );
};
test('sending does not reset body', async () => {
  const utils = setup('addPet');

  const editor = getAceEditor(utils);
  const aceBody = { foo: 2 };
  act(() => {
    editor.setValue(JSON.stringify(aceBody));
  });

  const assertFetchArgs = async () => {
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const body = await (fetchMock.mock.calls[0][0] as Request).json();
    expect(body).toEqual(aceBody);
  };

  const button = utils.getByRole('button');
  expect(button).not.toBeDisabled();
  userEvent.click(button);
  await assertFetchArgs();

  fetchMock.resetMocks();
  userEvent.click(button);
  await assertFetchArgs();
});

test('prevents sending if body is invalid json', async () => {
  const utils = setup('addPet');
  const editor = getAceEditor(utils);
  act(() => {
    editor.setValue('invalid JSON');
  });

  expect(utils.getByText('Body is invalid JSON')).toBeInTheDocument();
  expect(utils.getByText('Send Request')).toBeDisabled();
});

test('prevents sending if body is missing path parameters', async () => {
  const utils = setup('updatePetWithForm');
  expect(utils.getByText('Missing path parameters: petId')).toBeInTheDocument();
  expect(utils.getByText('Send Request')).toBeDisabled();
});

const getAceEditor = (utils: rtl.RenderResult): IAceEditor => {
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
