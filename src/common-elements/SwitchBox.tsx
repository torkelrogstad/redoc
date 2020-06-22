import * as React from 'react';
import Switch from 'react-switch';

import styled from '../styled-components';

const FlexLayout = styled.div`
  align-items: flex-end;
  display: flex;
  width: 100%;
  flex-direction: row-reverse;
`;

interface LabelProps {
  active: boolean;
}

const Label = styled.label<LabelProps>`
  color: ${props =>
    props.active ? props.theme.colors.success.main : props.theme.colors.text.secondary};
  margin-left: 10px;
  font-size: 120%;
`;

interface TryItOutProps {
  label: string;
  checked: boolean;
  onClick: () => void;
}

export const SwitchBox: React.FC<TryItOutProps> = ({ label, checked, onClick }) => {
  const id = 'toggle-id-' + Date.now();
  return (
    <FlexLayout>
      <Switch id={id} onChange={onClick} checked={checked} uncheckedIcon={false} />
      <Label active={checked} htmlFor={id}>
        {label}
      </Label>
    </FlexLayout>
  );
};
