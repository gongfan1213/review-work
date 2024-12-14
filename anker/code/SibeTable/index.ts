import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef, useMemo, useRef } from "react";
import SideCard from '../SideCard'
import "./index.scss";
import { useAllRight } from '../../hooks/context'
import clsx from 'clsx'
import left_icon from '../../../../images/2dEditor/left_icon.png'
import right_icon from '../../../../images/2dEditor/right_icon.png'
import ScrollMoreView from 'src/templates/2dEditor/common/widget/ScrollMoreView/ScrollMoreView';
import LottiePlayer from 'react-lottie-player'
import LoadingAnimation from 'src/images/lottie/loading.json'
import empty_data_icon from 'src/images/empty_upload.png';
import { isScrolledToRight } from 'src/templates/2dEditor/utils/utils'
import useCustomTranslation from "src/hooks/useCustomTranslation";
import { TranslationsKeys } from "src/templates/2dEditor/utils/TranslationsKeys";

// data数据中需要包含：图片地址，标题，各个标题对应的数量，是否已收藏
// isExpanded是当前某一项的展开状态，isExpanded为true时，展示所有的内容(点击过See AlL后)，为false时，只展示部分内容(未点击See All)
// useAllRight().state是全屏展示的开关状态，为true时，展示全屏展示，为false时，不展示全屏展示
// isLoading为初始模块加载更多,hasLoading是加载更多模块动画，hasMore为是否还有更多数据，
// fetchDataMore为加载更多的方法
// IsSeeAll为false使用旧数据，为true时使用新数据
// clearSeeAllState为清除全屏展示的状态
// item_refresh为刷新按钮的点击事件
// RefreshLoading为刷新按钮的加载动画,传入的是当前项的id
// isDetailsIcon为是否显示详情按钮
export default forwardRef(function SideTable(props: any) {
  const { data, active, CardClick, isLoading, hasLoading, hasMore, type, fetchDataMore, IsSeeAll, refdata, item_refresh, RefreshLoading,
    fetchListMore, ListMore, ListLoading, RightMoreData, isDetailsIcon
  } = props
  const { getTranslation } = useCustomTranslation();
  // 展开的项
  const [expandedStates, setExpandedStates] = useState<{ [key: string]: boolean }>({})
  const [canScrollLeft, setCanScrollLeft] = useState<{ [key: string]: boolean }>({});
  const [canScrollRight, setCanScrollRight] = useState<{ [key: string]: boolean }>({});
  const [nowItemClass, setNowItemClass] = useState()
  const PAGE_SIZE = 20;

  // 将子组件清空全屏展示的方法暴露给父组件使用
  useImperativeHandle(refdata, () => ({
    resetExpandedStates: () => {
      setExpandedStates({});
    }
  }));

  const SeeAllClick = (shouldExpand: boolean, id: string, item?: any) => {
    // 更新指定项的展开状态
    setExpandedStates(prevStates => ({
      // ...prevStates,
      [id]: shouldExpand
    }));
    setNowItemClass(item)
    // console.log("----,", item);
    // 只有seeAll点击时和全屏展开才会触发
    if (shouldExpand) {
      // 如果数据大于20条，点击seeAll时触发加载更多
      if (item?.list?.length >= 20) {
        if (item?.list.length < item?.total) {
          // console.log("item?.list.length", item?.list.length, "item?.total", item?.total);
          const NewPage = Math.ceil(item?.list.length / PAGE_SIZE) + 1;
          // 点击seeAll需要触发一次加载更多
          fetchDataMore(item, '', NewPage)
        }
      }
      IsSeeAll(true)
      const element = document.querySelector('.SideTable_box')
      if (element) {
        element.scrollTop = 0;
      }
    } else {
      // 数据恢复为之前没点击seeAll时的数据
      IsSeeAll(false)
    }
  }

  const handleScroll = (direction: string, id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const newScrollPosition = direction === 'left' ? element.scrollLeft - 100 : element.scrollLeft + 100;
      element.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollEvent = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 更新 canScrollLeft 状态
      setCanScrollLeft({
        ...canScrollLeft,
        [id]: element.scrollLeft > 0
      });
      // 更新 canScrollRight 状态
      setCanScrollRight({
        ...canScrollRight,
        [id]: Math.ceil(element.scrollLeft) + element.clientWidth < element.scrollWidth
      });
    }
  };

  // 当active变化时，重置所有状态
  useEffect(() => {
    setExpandedStates({});
    setCanScrollLeft({});
    setCanScrollRight({});
    setNowItemClass(undefined);
    IsSeeAll(false);
  }, [active]);

  //判断是否点击了seeAll 
  const isAll = useMemo(() => {
    return data?.find((it: any) => expandedStates[it.id])
  }, [data, expandedStates])

  const handleOnDrap = (e: any, data: any) => {
    e.preventDefault();
    CardClick(data);
  }

  // item:是dom结构
  const moreRightData = async (item: any, all: any) => {
    // 首先检查是否滚动到了右侧
    if (isScrolledToRight(item)) {
      try {
        // 尝试加载更多数据
        const res = await RightMoreData(all);
        // 如果加载成功，处理滚动事件
        if (res === 'success') {
          handleScrollEvent(item.id);
        }
      } catch (error) {
        // 处理可能发生的错误
        console.error("加载更多数据时发生错误:", error);
      }
    }
  }

  useEffect(() => {
    // 用于存储每个item的清理函数
    const cleanupFns: any = [];
    data?.forEach((item: any) => {
      const userContainer = document.getElementById(item?.id);
      if (userContainer) {
        const scrollHandler = () => {
          moreRightData(userContainer, item)
        };
        userContainer.addEventListener('scroll', scrollHandler);
        // 为每个item添加一个清理函数，用于移除事件监听器
        cleanupFns.push(() => userContainer.removeEventListener('scroll', scrollHandler));
      }
    });

    // 返回一个清理函数，它会调用所有item的清理函数
    return () => {
      cleanupFns.forEach((cleanup: any) => cleanup());
    };
  }, [data]);

  return (
    <div className="SideTable_box">
      {
        // 拆开展示，点击seeAll和未点击seeAll为两个组件
        isAll ? (
          <div
            className={clsx('SideTable_item')}
            key={isAll?.id}
          >
            {/* 每一项头部 */}
            <div className="item_top">
              <div className="item_title">{isAll.label}({isAll?.total})</div>
              {
                isAll?.list?.length >= 4 &&
                <div className="item_SeeAll" onClick={() => { SeeAllClick(false, isAll?.id, isAll) }}>
                  {getTranslation(TranslationsKeys.GoBack)}
                </div>
              }
            </div>
            <div style={{
              // height: type === 'ElementMenus' ? '600px' :
              //   type === 'TextMenus' ? '600px' :
              //     type === 'Templates' ? '650px' : '600px'
              height: '100%'
            }}>
              <ScrollMoreView
                onLoadMore={() => { fetchDataMore(isAll) }}
                hasMore={hasMore}
                isLoading={hasLoading}
              >
                <div
                  id={isAll.id}
                  className={clsx('item_down', {
                    'item_down_many': !useAllRight().state,
                    "item_down_fullScreen": useAllRight().state
                  })}
                >
                  {
                    isAll?.list?.map((res: any, index: any) => {
                      return (
                        <div
                          className={clsx({
                            // 'SideCard_box_few': !isExpanded,
                            'SideCard_box_many': true,
                            "SideCard_box_fullScreen": useAllRight().state
                          })}
                        >
                          <SideCard
                            CardData={res}
                            // 右侧全部展开时，宽高自适应，否则固定宽高
                            CardStyle={useAllRight().state ?
                              { 'width': '100%', 'height': '100%' } :
                              { 'width': '110px', 'height': '110px' }
                            }
                            isCollectClick={() => { }}
                            // RulesClick={() => { }}
                            CardClick={CardClick}
                            type={type}
                            isDetailsIcon={isDetailsIcon}
                          />
                        </div>
                      )
                    })
                  }
                </div>
              </ScrollMoreView>
            </div>

          </div>
        ) : (
          <ScrollMoreView
            onLoadMore={fetchListMore}
            hasMore={ListMore}
            isLoading={ListLoading}
          >
            {
              data?.map((item: any) => {
                // console.log("itemmmmmmmmm------=", item);
                return (
                  <>
                    <div
                      className={clsx('SideTable_item')}
                      key={item?.id}
                      onMouseEnter={() => handleScrollEvent(item.id)}
                      onMouseLeave={() => {
                        setCanScrollLeft({}),
                          setCanScrollRight({})
                      }}
                    >
                      {/* 每一项头部 */}
                      <div className="item_top">
                        {
                          // 当total为空时，不显示total与括号，否则显示total
                          <div className="item_title">
                            {item.label}
                            {item?.total ? `(${item.total})` : ''}
                          </div>
                        }
                        {
                          item?.list?.length >= 4 &&
                          <div className="item_SeeAll" onClick={() => { SeeAllClick(true, item?.id, item) }}>
                            {getTranslation(TranslationsKeys.SeeAll)}
                          </div>
                        }
                      </div>
                      <div className="item_fixed">
                        <>
                          {canScrollLeft[item.id] && <img src={left_icon} className="item_down_left" onClick={() => { handleScroll('left', item.id) }}></img>}
                          {canScrollRight[item.id] && <img src={right_icon} className="item_down_right" onClick={() => { handleScroll('right', item.id) }}></img>}
                        </>
                        {/* 当数据list为空时，说明数据加载失败，需要展示刷新(每一项不能为空) */}
                        {item?.list && item?.list.length === 0 ? (
                          <div className="item_refresh_box">
                            {/* 判断点击的是哪一项 */}
                            {RefreshLoading?.includes(item.id) ? (
                              <div className="loading">
                                <LottiePlayer
                                  loop
                                  play
                                  className="loadingBox"
                                  animationData={LoadingAnimation}
                                />
                              </div>
                            ) : (
                              <div className="no_data_refresh">
                                <div className="no_data_box">
                                  <img src={empty_data_icon} className="no_data_icon" alt="No data" />
                                  <div>{getTranslation(TranslationsKeys.NO_DATA_AVAILABLE)}</div>
                                </div>
                                <div className="item_refresh" onClick={() => item_refresh(item)}>
                                  {getTranslation(TranslationsKeys.Refresh)}
                                </div>
                              </div>
                            )
                            }
                          </div>
                        ) : (
                          <div
                            id={item.id}
                            // 实时监听滚动事件
                            className={clsx('item_down')}
                            onScroll={() => {
                              handleScrollEvent(item.id)
                            }}
                          >
                            {
                              item?.list?.map((res: any, index: any) => {
                                return (
                                  <div
                                    style={{
                                      'marginRight': index < item?.list.length - 1 ?
                                        '8px' : '0px',
                                    }}
                                    className={clsx('SideCard_box', {
                                      'SideCard_box_few': false,
                                      // 'SideCard_box_many': isExpanded,
                                    })}
                                    draggable={true}
                                    onDragEnd={(e) => handleOnDrap(e, res)}
                                  >
                                    <SideCard
                                      CardData={res}
                                      CardStyle={{ 'width': '110px', 'height': '110px' }}
                                      isCollectClick={() => { }}
                                      // RulesClick={() => { }}
                                      CardClick={CardClick}
                                      type={type}
                                      isDetailsIcon={isDetailsIcon}
                                    />
                                  </div>
                                )
                              })
                            }
                          </div>)}
                      </div>
                    </div>
                  </>
                )
              })
            }
          </ScrollMoreView>
        )
      }
      {(isLoading) && (
        <div className="load">
          <LottiePlayer
            loop
            play
            className="loadingBox"
            animationData={LoadingAnimation}
          />
        </div>
      )}
    </div>
  )
}
)
