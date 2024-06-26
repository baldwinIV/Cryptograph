import * as d3 from 'd3';
import {
  useState,
  useEffect,
  useRef,
  RefObject,
  FunctionComponent,
  SetStateAction,
  Dispatch
} from 'react';
import {
  CoinRateContentType,
  CoinRateType,
  MainChartPointerData
} from '@/types/ChartTypes';
import { useRefElementSize } from 'hooks/useRefElementSize';
import {
  colorQuantizeScale,
  MainChartHandleMouseEvent
} from '@/utils/chartManager';
import { convertUnit } from '@/utils/chartManager';
import {
  DEFAULT_RUNNING_POINTER_DATA,
  RUNNING_CHART_RATE_MULTIPLIER,
  RUNNING_CHART_NAME_MULTIPLIER
} from '@/constants/ChartConstants';
import ChartTagController from '../ChartTagController';
import { styled } from '@mui/material';

//------------------------------interface------------------------------
interface RunningChartProps {
  data: CoinRateType; //선택된 코인 리스트
  Market: string[];
  selectedSort: string;
  modalOpenHandler: (market: string) => void;
  durationPeriod?: number;
  isMobile: boolean;
}

//------------------------------setChartContainerSize------------------------------
const setChartContainerSize = (
  svgRef: RefObject<SVGSVGElement>,
  width: number,
  height: number
) => {
  const chartContainer = d3.select(svgRef.current);
  chartContainer.attr('width', width);
  chartContainer.attr('height', height);
};

//------------------------------updateChart------------------------------
const updateChart = (
  durationPeriod: number,
  svgRef: RefObject<SVGSVGElement>,
  data: CoinRateType,
  width: number,
  height: number,
  candleCount: number,
  selectedSort: string,
  nodeOnclickHandler: (market: string) => void,
  setPointerHandler: Dispatch<SetStateAction<MainChartPointerData>>,
  isMobile: boolean
) => {
  //ArrayDataValue : 기존 Object<object>이던 data를 data.value, 즉 실시간변동 퍼센테이지 값만 추출해서 Array<object>로 변경
  const ArrayDataValue: CoinRateContentType[] = [
    ...Object.values<CoinRateContentType>(data)
  ].sort((a, b) => {
    switch (selectedSort) {
      case 'descending':
        return d3.descending(a.value, b.value); // 내림차순
      case 'ascending':
        return d3.ascending(a.value, b.value); // 오름차순
      case 'absolute':
        return d3.descending(Math.abs(a.value), Math.abs(b.value)); // 절댓값
      case 'trade price':
        return d3.descending(a.acc_trade_price_24h, b.acc_trade_price_24h); // 거래량
      default:
        return d3.descending(a.market_cap, b.market_cap); //시가총액
    }
  });
  const max = (() => {
    switch (selectedSort) {
      case 'descending':
        return d3.max(ArrayDataValue, d => Math.abs(d.value)); // 내림차순
      case 'ascending':
        return d3.max(ArrayDataValue, d => Math.abs(d.value)); // 오름차순
      case 'absolute':
        return d3.max(ArrayDataValue, d => Math.abs(d.value)); // 절댓값
      case 'trade price':
        return d3.max(ArrayDataValue, d => d.acc_trade_price_24h); // 거래량
      default:
        return d3.max(ArrayDataValue, d => d.market_cap); //시가총액
    }
  })();

  if (max === undefined) {
    console.error('정상적인 등락률 데이터가 아닙니다.');
    return;
  }
  const threshold = max <= 66 ? (max <= 33 ? 33 : 66) : Math.max(max, 100); // 66보다 큰 경우는 시가총액 or 66% 이상
  const domainRange = [0, threshold];

  const barMargin = height / 10 / 5; //바 사이사이 마진값
  const barHeight = Math.max(
    Math.min(height / candleCount, height / 15),
    height / 20
  ); //각각의 수평 바 y 높이
  setChartContainerSize(svgRef, width, (barHeight + barMargin) * candleCount);

  const scale = d3
    .scaleLinear()
    .domain(domainRange)
    .range([100, width - 100]);

  const svgChart = d3
    .select('#running-chart')
    .attr('width', width)
    .attr('height', (barHeight + barMargin) * candleCount);

  svgChart
    .selectAll<SVGSVGElement, CoinRateContentType>('g')
    .data(ArrayDataValue, d => d.name)
    .join(
      enter => {
        const $g = enter
          .append('g')
          .on('click', function (e, d) {
            nodeOnclickHandler(d.ticker.split('-')[1]);
          }) //this 사용을 위해 함수 선언문 형식 사용
          .on('mousemove', function (d, i) {
            if (isMobile) return;
            d3.select(this).style('opacity', '.70');
            MainChartHandleMouseEvent(d, setPointerHandler, i, width, height);
          })
          //this 사용을 위해 함수 선언문 형식 사용
          .on('mouseleave', function (d, i) {
            if (isMobile) return;
            d3.select(this).style('opacity', '1');
            MainChartHandleMouseEvent(d, setPointerHandler, i, width, height);
          });
        $g.attr(
          'transform',
          (d, i) => 'translate(0,' + i * (barHeight + barMargin) + ')'
        )
          .style('opacity', 1)
          .style('cursor', 'pointer');
        $g.append('rect')
          .attr('height', barHeight)
          .transition()
          .duration(durationPeriod)
          .attr('width', d => {
            return scale(
              selectedSort !== 'trade price'
                ? selectedSort !== 'market capitalization'
                  ? Math.abs(d.value)
                  : d.market_cap
                : d.acc_trade_price_24h
            );
          })

          .style('fill', d => {
            if (d.value > 0) return colorQuantizeScale(max, d.value);
            else if (d.value === 0) return 'gray';
            else {
              return colorQuantizeScale(max, d.value);
            }
          });

        $g.append('text')

          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')

          .text(d =>
            selectedSort !== 'trade price'
              ? selectedSort === 'market capitalization'
                ? convertUnit(Number(d.market_cap))
                : String(Number(d.value).toFixed(2)) + '%'
              : convertUnit(Number(d.acc_trade_price_24h))
          )
          .attr('y', barHeight / 2)
          .transition()
          .duration(durationPeriod * 2)
          .style('font-size', `${barHeight * RUNNING_CHART_RATE_MULTIPLIER}px`)
          .attr('x', d => {
            return (
              scale(
                selectedSort !== 'trade price'
                  ? selectedSort !== 'market capitalization'
                    ? Math.abs(d.value)
                    : d.market_cap
                  : d.acc_trade_price_24h
              ) / 2
            );
          });

        $g.append('text')
          .attr('class', 'CoinName')
          .style('font-size', `${barHeight * RUNNING_CHART_NAME_MULTIPLIER}px`)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .text(d => d.ticker.split('-')[1])
          .attr('y', barHeight / 2)
          .transition()
          .duration(durationPeriod * 1)
          .attr('x', d => {
            return scale(
              selectedSort !== 'trade price'
                ? selectedSort !== 'market capitalization'
                  ? Math.abs(d.value)
                  : d.market_cap
                : d.acc_trade_price_24h
            );
          });

        return $g;
      },
      update => {
        update
          .on('click', function (e, d) {
            nodeOnclickHandler(d.ticker.split('-')[1]);
          }) //this 사용을 위해 함수 선언문 형식 사용
          .on('mousemove', function (d, i) {
            if (isMobile) return;
            d3.select(this).style('opacity', '.70');
            MainChartHandleMouseEvent(d, setPointerHandler, i, width, height);
          })
          .on('mouseleave', function (d, i) {
            if (isMobile) return;
            d3.select(this).style('opacity', '1');
            MainChartHandleMouseEvent(d, setPointerHandler, i, width, height);
          });
        update
          .transition()
          .duration(durationPeriod)
          .attr(
            'transform',
            (d, i) => `translate(0,  ${i * (barHeight + barMargin)} )`
          );

        update
          .select('rect')
          .transition()
          .duration(durationPeriod)
          .attr('height', barHeight)
          .attr('width', d => {
            return scale(
              selectedSort !== 'trade price'
                ? selectedSort !== 'market capitalization'
                  ? Math.abs(d.value)
                  : d.market_cap
                : d.acc_trade_price_24h
            );
          })
          .style('fill', d => {
            if (d.value > 0) return colorQuantizeScale(max, d.value);
            else if (d.value === 0) return 'gray';
            else return colorQuantizeScale(max, d.value);
          });
        update
          .select('text')
          .attr('x', d => {
            return (
              scale(
                selectedSort !== 'trade price'
                  ? selectedSort !== 'market capitalization'
                    ? Math.abs(d.value)
                    : d.market_cap
                  : d.acc_trade_price_24h
              ) / 2
            );
          })
          .attr('y', barHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', `${barHeight * RUNNING_CHART_RATE_MULTIPLIER}px`)
          .text(d =>
            selectedSort !== 'trade price'
              ? selectedSort === 'market capitalization'
                ? convertUnit(Number(d.market_cap))
                : String(Number(d.value).toFixed(2)) + '%'
              : convertUnit(Number(d.acc_trade_price_24h))
          );

        update
          .select('.CoinName')
          .transition()
          .duration(durationPeriod)
          .attr('x', d => {
            return scale(
              selectedSort !== 'trade price'
                ? selectedSort !== 'market capitalization'
                  ? Math.abs(d.value)
                  : d.market_cap
                : d.acc_trade_price_24h
            );
          })
          .attr('y', barHeight / 2)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .style('font-size', `${barHeight * RUNNING_CHART_NAME_MULTIPLIER}px`)
          .text(d => d.ticker.split('-')[1]);
        return update;
      },
      exit => {
        exit.remove();
      }
    );
};
//------------------------------Component------------------------------
export const RunningChart: FunctionComponent<RunningChartProps> = ({
  durationPeriod = 500,
  data,
  Market,
  selectedSort,
  modalOpenHandler,
  isMobile
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartSvg = useRef(null);
  const { width, height } = useRefElementSize(chartContainerRef);
  const [changeRate, setchangeRate] = useState<CoinRateType>({}); //선택된 코인 값만 보유
  const [pointerInfo, setPointerInfo] = useState<MainChartPointerData>(
    DEFAULT_RUNNING_POINTER_DATA
  );

  useEffect(() => {
    if (!Object.keys(changeRate).length) return;
    updateChart(
      durationPeriod,
      chartSvg,
      changeRate,
      width,
      height,
      Market.length,
      selectedSort,
      modalOpenHandler,
      setPointerInfo,
      isMobile
    );
  }, [
    width,
    height,
    changeRate,
    selectedSort,
    durationPeriod,
    Market.length,
    modalOpenHandler,
    isMobile
  ]); // 창크기에 따른 차트크기 조절
  useEffect(() => {
    if (!data || !Market[0]) return;
    const newCoinData: CoinRateType = {};
    for (const tick of Market) {
      newCoinData['KRW-' + tick] = data['KRW-' + tick];
    }
    setchangeRate(newCoinData);
  }, [data, Market]);
  return (
    <ChartContainer ref={chartContainerRef}>
      <svg id="chart-container" ref={chartSvg}>
        <svg id="running-chart" />
      </svg>
      <ChartTagController pointerInfo={pointerInfo} />
    </ChartContainer>
  );
};
const ChartContainer = styled('div')`
  display: flex;
  width: 100%;
  background: #ffffff;
  height: 100%;
  overflow: auto;
`;
