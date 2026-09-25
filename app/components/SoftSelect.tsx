"use client";

import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";

export type SoftSelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

/** Shared accessible, portalled select: never clipped by photo or motion wrappers. */
export default function SoftSelect({ value, onValueChange, options, label, id, disabled }: {
  value: string;
  onValueChange: (value: string) => void;
  options: SoftSelectOption[];
  label: string;
  id?: string;
  disabled?: boolean;
}) {
  return <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
    <Select.Trigger id={id} className="soft-select-trigger" aria-label={label}>
      <Select.Value />
      <Select.Icon className="soft-select-chevron"><ChevronDownIcon /></Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="soft-select-menu" position="popper" sideOffset={8} collisionPadding={12}>
        <Select.ScrollUpButton className="soft-select-scroll"><ChevronUpIcon /></Select.ScrollUpButton>
        <Select.Viewport className="soft-select-viewport">
          {options.map(option => <Select.Item className="soft-select-item" value={option.value} key={option.value} textValue={option.label}>
            {option.icon && <span className="soft-select-item-icon" aria-hidden="true">{option.icon}</span>}
            <span className="soft-select-item-copy"><Select.ItemText>{option.label}</Select.ItemText>
              {option.description && <small>{option.description}</small>}
            </span>
            <Select.ItemIndicator className="soft-select-check"><CheckIcon /></Select.ItemIndicator>
          </Select.Item>)}
        </Select.Viewport>
        <Select.ScrollDownButton className="soft-select-scroll"><ChevronDownIcon /></Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}
