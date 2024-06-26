import {
  useRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  FunctionComponent
} from 'react';
import {
  CandleChartOption,
  CandleChartRenderOption,
  CandleData,
  PointerData
} from '@/types/ChartTypes';
import {
  checkNeedFetch,
  getInitRenderOption,
  getRenderOptionByWindow,
  updatePointerUI
} from '@/utils/chartManager';
import {
  DEFAULT_POINTER_DATA,
  MAX_FETCH_CANDLE_COUNT
} from '@/constants/ChartConstants';
import { getCandleDataArray } from '@/utils/upbitManager';
import { useRefElementSize } from 'hooks/useRefElementSize';
import { styled } from '@mui/material';
import {
  initCandleChart,
  translateCandleChart,
  updateCandleChart
} from './chartController';
export interface CandleChartProps {
  chartOption: CandleChartOption;
  candleData: CandleData[];
  candleDataSetter: Dispatch<SetStateAction<CandleData[]>>;
}

export const CandleChart: FunctionComponent<CandleChartProps> = props => {
  const chartSvg = useRef<SVGSVGElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const refElementSize = useRefElementSize(chartContainerRef);
  // 렌더링에 관여하는 모든 속성들
  const [option, setOption] = useState<CandleChartRenderOption>(
    getInitRenderOption(refElementSize.width)
  );
  // 캔들유닛들이 얼마나 translate되어있는지 분리
  const [translateX, setTranslateX] = useState<number>(0);
  const [pointerInfo, setPointerInfo] =
    useState<PointerData>(DEFAULT_POINTER_DATA);
  const isFetching = useRef(false);

  // 차트 초기화 차트 구성요소 크기지정 및 렌더링 옵션 지정(창의 크기에 맞추어 변경)
  useEffect(() => {
    initCandleChart(
      chartSvg,
      setTranslateX,
      setOption,
      setPointerInfo,
      refElementSize
    );
    setOption(prev => getRenderOptionByWindow(refElementSize.width, prev));
    setPointerInfo(DEFAULT_POINTER_DATA);
  }, [refElementSize]);

  // period혹은 market이 변경되면 모든 렌더옵션 초기화
  useEffect(() => {
    setOption(getInitRenderOption(refElementSize.width));
  }, [props.chartOption]);

  // translateX의 변경에 따라 기존의 문서요소들을 이동만 시킨다.
  useEffect(() => {
    if (translateX < 0) {
      if (option.renderStartDataIndex === 0) {
        setTranslateX(0);
        return;
      }
      setTranslateX(prev => option.candleWidth + (prev % option.candleWidth));
      setOption(prev => {
        const newOption = { ...prev };
        newOption.renderStartDataIndex = Math.max(
          newOption.renderStartDataIndex +
            Math.floor(translateX / option.candleWidth),
          0
        );
        return newOption;
      });
      return;
    }
    if (option.renderStartDataIndex === option.maxRenderStartDataIndex) {
      setTranslateX(0);
      return;
    }
    if (translateX >= option.candleWidth) {
      setTranslateX(prev => prev % option.candleWidth);
      setOption(prev => {
        const newRenderStartDataIndex = Math.min(
          prev.maxRenderStartDataIndex,
          prev.renderStartDataIndex +
            Math.floor(translateX / option.candleWidth)
        );
        return { ...prev, renderStartDataIndex: newRenderStartDataIndex };
      });
      return;
    }
    translateCandleChart(chartSvg, translateX);
  }, [translateX, refElementSize, option]);

  // 문서요소들을 다시 join해야할때
  // 더 최적화하려면 소켓을 통해 들어오는 0번 데이터 처리하기
  useEffect(() => {
    const needFetch = checkNeedFetch(props.candleData, option);
    if (needFetch && option.maxDataLength === Infinity) {
      if (!isFetching.current) {
        isFetching.current = true;
        getCandleDataArray(
          props.chartOption.candlePeriod,
          props.chartOption.marketType,
          MAX_FETCH_CANDLE_COUNT,
          props.candleData[props.candleData.length - 1].candle_date_time_utc
        ).then(res => {
          if (res === null) {
            console.error('코인 쿼리 실패, 404에러');
            return;
          }
          if (res.length === 0) {
            isFetching.current = false;
            setOption(prev => {
              return {
                ...prev,
                maxDataLength: props.candleData.length,
                maxRenderStartDataIndex:
                  props.candleData.length - prev.renderCandleCount + 1
              };
            });
            return;
          }
          isFetching.current = false;
          props.candleDataSetter(prev => {
            const lastDate = new Date(
              prev[prev.length - 1].candle_date_time_kst
            );
            const newDate = new Date(res[0].candle_date_time_kst);
            if (newDate < lastDate) {
              return [...prev, ...res];
            }
            return [...prev];
          });
        });
      }
      return;
    }
    updateCandleChart(
      chartSvg,
      props.candleData,
      option,
      refElementSize,
      props.chartOption.candlePeriod,
      translateX
    );
  }, [props, option, refElementSize]);

  useEffect(() => {
    updatePointerUI(
      pointerInfo,
      option,
      props.candleData,
      refElementSize,
      props.chartOption.candlePeriod
    );
  }, [pointerInfo, refElementSize, option, props]);

  return (
    <ChartContainer ref={chartContainerRef}>
      <svg id="chart-container" ref={chartSvg}>
        <g id="y-axis" />
        <svg id="x-axis-container">
          <g id="x-axis" />
        </svg>
        <svg id="chart-area" />
        <svg id="current-price">
          <line />
          <rect />
          <text />
        </svg>
        <svg id="mouse-pointer-UI"></svg>
        <svg id="volume-UI"></svg>
        <text id="price-info"></text>
      </svg>
    </ChartContainer>
  );
};

const ChartContainer = styled('div')`
  display: flex;
  height: 100%;
  width: 100%;
  background: #ffffff;
  ${props => props.theme.breakpoints.down('tablet')} {
    height: calc(100% - 50px);
    min-height: 300px;
  }
`;
