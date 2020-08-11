import * as rtl from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { ConsoleViewer } from './ConsoleViewer';
import { RedocNormalizedOptions } from '../../services';
import { ThemeProvider } from 'styled-components';
import { waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { act } from 'react-dom/test-utils';
import { findOperation, getSpec, getAceEditor } from './ConsoleTestUtil';

const setup = (operationId: string) => {
  const options = new RedocNormalizedOptions({});
  const spec = getSpec('openapi.yaml');

  return rtl.render(
    <ThemeProvider theme={options.theme}>
      <ConsoleViewer
        securitySchemes={spec.securitySchemes}
        urlIndex={0}
        operation={findOperation(operationId, spec)}
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
