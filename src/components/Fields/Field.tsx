import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';

import { ClickablePropertyNameCell, RequiredLabel } from '../../common-elements/fields';
import { FieldDetails } from './FieldDetails';

import {
  InnerPropertiesWrap,
  PropertyBullet,
  PropertyCellWithInner,
  PropertyDetailsCell,
  PropertyNameCell,
} from '../../common-elements/fields-layout';

import { ShelfIcon, StyledDropdown } from '../../common-elements/';

import { FieldModel } from '../../services/models';
import { Schema, SchemaOptions } from '../Schema/Schema';
import { interactiveStore } from '../../services/InteractiveStore';

export interface FieldProps extends SchemaOptions {
  className?: string;
  isLast?: boolean;
  showExamples?: boolean;

  field: FieldModel;
  expandByDefault?: boolean;
  interactive?: boolean;

  renderDiscriminatorSwitch?: (opts: FieldProps) => JSX.Element;
}

@observer
export class Field extends React.Component<FieldProps> {
  toggle = () => {
    if (this.props.field.expanded === undefined && this.props.expandByDefault) {
      this.props.field.expanded = false;
    } else {
      this.props.field.toggle();
    }
  };

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.toggle();
    }
  };

  onFieldChange = (argument: string) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    interactiveStore.addParameter(argument, evt.target.value);
    this.props.field.setValue(evt.target.value);
  };

  /** Clear text field when interactive mode is switched off */
  componentDidUpdate(prevProps: FieldProps) {
    if (prevProps.interactive && !this.props.interactive) {
      this.props.field.setValue('');
    }
  }

  render() {
    const { className, field, isLast, expandByDefault } = this.props;
    const { name, deprecated, required, kind } = field;
    const withSubSchema = !field.schema.isPrimitive && !field.schema.isCircular;

    const expanded = field.expanded === undefined ? expandByDefault : field.expanded;

    const paramName = withSubSchema ? (
      <ClickablePropertyNameCell
        className={deprecated ? 'deprecated' : ''}
        kind={kind}
        title={name}
      >
        <PropertyBullet />
        <button
          onClick={this.toggle}
          onKeyPress={this.handleKeyPress}
          aria-label="expand properties"
        >
          {name}
          <i>
            <ShelfIcon direction={expanded ? 'down' : 'right'} />
          </i>
        </button>
        {required && <RequiredLabel> required </RequiredLabel>}
      </ClickablePropertyNameCell>
    ) : (
      <PropertyNameCell className={deprecated ? 'deprecated' : undefined} kind={kind} title={name}>
        <PropertyBullet />
        {name}
        {required && <RequiredLabel> required </RequiredLabel>}
      </PropertyNameCell>
    );

    const getInteractiveField = (field: FieldModel): JSX.Element | undefined => {
      if (!this.props.interactive) {
        return undefined;
      }
      if (field.in === 'query') {
        if (field.schema.enum.length !== 0) {
          return (
            <StyledDropdown
              onChange={({ value }) => {
                console.warn('value', value);
                const newValue = value === 'empty' ? '' : value;
                this.props.field.setValue(newValue);
              }}
              options={[{ value: 'empty' }, ...field.schema.enum.map(value => ({ value }))]}
              value={this.props.field.$value}
            />
          );
        }
        return <TextField placeholder={field.name} onChange={this.onFieldChange(field.name)} />;
      }
      if (field.in === 'path') {
        return <TextField placeholder={field.name} onChange={this.onFieldChange(field.name)} />;
      }

      return undefined;
    };

    return (
      <>
        <tr className={isLast ? 'last ' + className : className}>
          {paramName}
          <PropertyDetailsCell>
            <FieldDetails {...this.props} />
            {getInteractiveField(field)}
          </PropertyDetailsCell>
          {field.expanded && withSubSchema && (
            <tr key={field.name + 'inner'}>
              <PropertyCellWithInner colSpan={2}>
                <InnerPropertiesWrap>
                  <Schema
                    schema={field.schema}
                    skipReadOnly={this.props.skipReadOnly}
                    skipWriteOnly={this.props.skipWriteOnly}
                    showTitle={this.props.showTitle}
                  />
                </InnerPropertiesWrap>
              </PropertyCellWithInner>
            </tr>
          )}
        </tr>
        {expanded && withSubSchema && (
          <tr key={field.name + 'inner'}>
            <PropertyCellWithInner colSpan={2}>
              <InnerPropertiesWrap>
                <Schema
                  schema={field.schema}
                  skipReadOnly={this.props.skipReadOnly}
                  skipWriteOnly={this.props.skipWriteOnly}
                  showTitle={this.props.showTitle}
                />
              </InnerPropertiesWrap>
            </PropertyCellWithInner>
          </tr>
        )}
      </>
    );
  }
}

const TextField = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  border: 1px solid rgba(38, 50, 56, 0.5);
  border-radius: 3px;
`;
