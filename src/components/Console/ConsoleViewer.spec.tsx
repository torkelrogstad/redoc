import * as rtl from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import * as path from 'path';
import * as yaml from 'yaml-js';
import { ConsoleViewer } from './ConsoleViewer';
import { SpecStore, RedocNormalizedOptions, OperationModel } from '../../services';
import { readFileSync } from 'fs';
import { ThemeProvider } from 'styled-components';
import { waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { IAceEditor } from 'react-ace/lib/types';
import { act } from 'react-dom/test-utils';

test('sending does not reset body', async () => {
  const options = new RedocNormalizedOptions({});
  const spec = readFileSync(path.join(__filename, '..', '..', '..', '..', 'demo', 'openapi.yaml'));
  const specStore = new SpecStore(yaml.load(spec), undefined, options);

  const general = specStore.contentItems.find((item) => item.name === 'General');
  expect(general).toBeDefined();

  const pet = general?.items.find((item) => item.description === 'Everything about your Pets');
  expect(pet).toBeDefined();

  const newPet = pet?.items.find(
    (item) => item.description === 'Add new pet to the store inventory.',
  );
  expect(newPet).toBeDefined();

  const utils = rtl.render(
    <ThemeProvider theme={options.theme}>
      <ConsoleViewer
        securitySchemes={specStore.securitySchemes}
        urlIndex={0}
        operation={newPet as OperationModel}
      />
    </ThemeProvider>,
  );

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
  userEvent.click(button);
  await assertFetchArgs();

  fetchMock.resetMocks();
  userEvent.click(button);
  await assertFetchArgs();
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
