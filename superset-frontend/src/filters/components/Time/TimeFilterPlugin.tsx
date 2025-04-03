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
import { FilterPluginStyle, StyledFormItem, FilterContainer } from '../common';

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
  margin: 0;

  .ant-picker {
    margin: 0;
    padding: 0;
  }
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
      const isSet = start && end && start.isValid() && end.isValid();
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
      try {
        const [start, end] = filterState.value.split(' : ');
        const parsedStart = dayjs(start);
        const parsedEnd = dayjs(end);

        if (parsedStart.isValid() && parsedEnd.isValid()) {
          setStartDate(parsedStart);
          setEndDate(parsedEnd);
        } else {
          setStartDate(null);
          setEndDate(null);
        }
      } catch (error) {
        setStartDate(null);
        setEndDate(null);
      }
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [filterState.value]);

  return props.formData?.inView ? (
    <FilterPluginStyle width={width} height={height}>
      <FilterContainer>
        <StyledFormItem
          validateStatus={filterState.validateStatus}
          label={props.formData.label}
        >
          <DateRangeContainer
            ref={inputRef}
            onFocus={setFocusedFilter}
            onBlur={unsetFocusedFilter}
            onMouseEnter={setHoveredFilter}
            onMouseLeave={unsetHoveredFilter}
          >
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
        </StyledFormItem>
      </FilterContainer>
    </FilterPluginStyle>
  ) : null;
}
