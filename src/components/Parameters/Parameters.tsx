import * as React from 'react';
import { DropdownOrLabel } from '../DropdownOrLabel/DropdownOrLabel';
import { ParametersGroup } from './ParametersGroup';

import { UnderlinedHeader } from '../../common-elements';

import { MediaContentModel } from '../../services';
import { FieldModel, RequestBodyModel } from '../../services/models';
import { MediaTypesSwitch } from '../MediaTypeSwitch/MediaTypesSwitch';
import { Schema } from '../Schema';

import { Markdown } from '../Markdown/Markdown';
import { interactiveStore } from '../../services/InteractiveStore';
import { observer } from 'mobx-react';

function safePush(obj, prop, item) {
  if (!obj[prop]) {
    obj[prop] = [];
  }
  obj[prop].push(item);
}

export interface ParametersProps {
  parameters?: FieldModel[];
  body?: RequestBodyModel;
  operationId?: string;
}

const PARAM_PLACES = ['path', 'query', 'cookie', 'header'];

@observer
export class Parameters extends React.PureComponent<ParametersProps> {
  orderParams(params: FieldModel[]): Record<string, FieldModel[]> {
    const res = {};
    params.forEach(param => {
      safePush(res, param.in, param);
    });
    return res;
  }

  render() {
    const { body, parameters = [] } = this.props;
    if (body === undefined && parameters === undefined) {
      return null;
    }

    const paramsMap = this.orderParams(parameters);

    const paramsPlaces = parameters.length > 0 ? PARAM_PLACES : [];

    const bodyContent = body && body.content;

    const bodyDescription = body && body.description;

    const interactive =
      this.props.operationId !== undefined &&
      this.props.operationId === interactiveStore.active?.operationId;
    return (
      <>
        {paramsPlaces.map(place => (
          <ParametersGroup
            interactive={interactive}
            key={place}
            place={place}
            parameters={paramsMap[place]}
          />
        ))}
        {bodyContent && <BodyContent content={bodyContent} description={bodyDescription} />}
      </>
    );
  }
}

function DropdownWithinHeader(props) {
  return (
    <UnderlinedHeader key="header">
      Request Body schema: <DropdownOrLabel {...props} />
    </UnderlinedHeader>
  );
}

function BodyContent(props: { content: MediaContentModel; description?: string }): JSX.Element {
  const { content, description } = props;
  return (
    <MediaTypesSwitch content={content} renderDropdown={DropdownWithinHeader}>
      {({ schema }) => {
        return (
          <>
            {description !== undefined && <Markdown source={description} />}
            <Schema skipReadOnly={true} key="schema" schema={schema} />
          </>
        );
      }}
    </MediaTypesSwitch>
  );
}
