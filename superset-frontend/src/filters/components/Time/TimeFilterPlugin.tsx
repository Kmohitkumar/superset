/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { styled, NO_TIME_RANGE, t } from '@superset-ui/core';
import { useCallback, useEffect, useState } from 'react';
import { DatePicker } from 'src/components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { PluginFilterTimeProps } from './types';
import { FilterPluginStyle } from '../common';

const TimeFilterStyles = styled(FilterPluginStyle)`
  display: flex;
  align-items: center;
  overflow-x: auto;

  & .ant-tag {
    margin-right: 0;
  }
`;

const ControlContainer = styled.div<{
  validateStatus?: 'error' | 'warning' | 'info';
}>`
  display: flex;
  height: 100%;
  max-width: 100%;
  width: 100%;
  & > div,
  & > div:hover {
    ${({ validateStatus, theme }) =>
      validateStatus && `border-color: ${theme.colors[validateStatus]?.base}`}
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: ${({ theme }) => theme.colors.grayscale.light5};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  width: 100%;

  .ant-picker {
    margin: 0;
    padding: 0;
  }
`;

const FilterLabel = styled.div`
  color: ${({ theme }) => theme.colors.grayscale.base};
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
`;

export default function TimeFilterPlugin(props: PluginFilterTimeProps) {
  const {
    setDataMask,
    setHoveredFilter,
    unsetHoveredFilter,
    setFocusedFilter,
    unsetFocusedFilter,
    setFilterActive,
    width,
    height,
    filterState,
    inputRef,
    isOverflowingFilterBar = false,
  } = props;

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const handleTimeRangeChange = useCallback(
    (start: Dayjs | null, end: Dayjs | null): void => {
      const isSet = start && end;
      setDataMask({
        extraFormData: isSet
          ? {
              time_range: `${start.format('YYYY-MM-DD')} : ${end.format('YYYY-MM-DD')}`,
            }
          : {},
        filterState: {
          value: isSet
            ? `${start.format('YYYY-MM-DD')} : ${end.format('YYYY-MM-DD')}`
            : undefined,
        },
      });
    },
    [setDataMask],
  );

  useEffect(() => {
    if (filterState.value && filterState.value !== NO_TIME_RANGE) {
      const [start, end] = filterState.value.split(' : ');
      setStartDate(dayjs(start));
      setEndDate(dayjs(end));
    }
  }, [filterState.value]);

  return props.formData?.inView ? (
    <TimeFilterStyles width={width} height={height}>
      <ControlContainer
        ref={inputRef}
        validateStatus={filterState.validateStatus}
        onFocus={setFocusedFilter}
        onBlur={unsetFocusedFilter}
        onMouseEnter={setHoveredFilter}
        onMouseLeave={unsetHoveredFilter}
      >
        <div style={{ width: '100%' }}>
          <FilterLabel>{props.formData.label}</FilterLabel>
          <DateRangeContainer>
            <DatePicker
              value={startDate}
              onChange={date => {
                setStartDate(date);
                handleTimeRangeChange(date, endDate);
              }}
              placeholder={t('Start date')}
            />
            <DatePicker
              value={endDate}
              onChange={date => {
                setEndDate(date);
                handleTimeRangeChange(startDate, date);
              }}
              placeholder={t('End date')}
            />
          </DateRangeContainer>
        </div>
      </ControlContainer>
    </TimeFilterStyles>
  ) : null;
}
