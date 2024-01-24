import { Link } from 'components/common';
import classNames from 'classnames';
import { CaretDownFilled } from '@ant-design/icons';
import { ITableProps } from './interfaces';
import Preloader from '../Preloader';
import { FC, Fragment } from 'react';

const Table: FC<ITableProps> = ({
  cols,
  rows,
  rowsLoading,
  title,
  className,
  style,
  hideHead,
}) => {
  return (
    <div className={classNames(['tableInf', className])} style={style}>
      {!!title && title.trim().length > 0 && (
        <h3 className="tableInf__title">{title}</h3>
      )}
      {rowsLoading && (
        <div className="tableInf__preloader">
          <Preloader showPreloaderDelay={200} />
        </div>
      )}
      <table className="tableInf__list tableInf__list_little null">
        <tbody>
          {!hideHead && (
            <tr className="tableInf__item">
              {cols.filter(Boolean).map((col, colIndex) =>
                col.childrens ? (
                  <td
                    key={colIndex}
                    className={classNames(
                      'table-col d-flex flex-direction-column',
                      [
                        'tableInf__infText table-col text_13',
                        'no-padding',
                        col.className,
                      ],
                      {
                        tableInf__infText_noBg: col.noBg,
                        'has-filter': col.hasFilter,
                        'table-col--border-highlighted': col.highlightBorder,
                      },
                    )}
                    style={{
                      width:
                        typeof col.width === 'string'
                          ? Number(col.width.split('%')[0]) *
                              col.childrens.length +
                            '%'
                          : col.width,
                      ...col.style,
                    }}
                    onClick={col.onFilterChange}
                  >
                    <span className="table-col__content pb-5 mb-5">
                      <span className="table-col__title">{col.content}</span>
                    </span>
                    <div className="table-col__content__children d-flex w-100">
                      {col.childrens.map((children, i) => (
                        <span key={i} className="table-col__content">
                          <span className="table-col__title">{children}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                ) : (
                  <td
                    key={colIndex}
                    className={classNames(
                      'table-col',
                      ['tableInf__infText table-col text_13', col.className],
                      {
                        tableInf__infText_noBg: col.noBg,
                        'has-filter': col.hasFilter,
                        'table-col--border-highlighted': col.highlightBorder,
                      },
                    )}
                    style={{ width: col.width, ...col.style }}
                    onClick={col.onFilterChange}
                  >
                    <span className={classNames('table-col__content')}>
                      <span className="table-col__title">
                        {col.content}
                        {col.hasFilter && (
                          <span
                            className={classNames('table-col__filter', {
                              'direction-up': col.filterDirection === 'up',
                              inactive: !col.filterDirection,
                            })}
                          >
                            <CaretDownFilled />
                          </span>
                        )}
                      </span>
                    </span>
                  </td>
                ),
              )}
            </tr>
          )}

          {rows.map((row, rowIndex) => (
            <Fragment key={rowIndex}>
              <tr
                className={classNames(['tableInf__item', row.className], {
                  tableInf__infText_noBg: row.noBg,
                  'tableInf__item--border-top': row.borderTop,
                  'tableInf__item--border-bottom': row.borderBottom,
                  'tableInf__item--bg-transparent':
                    (hideHead ? rowIndex + 1 : rowIndex) % 2 === 0,
                })}
                onClick={row?.onClick}
                onDoubleClick={row?.onDoubleClick}
                onMouseEnter={row?.onMouseEnter}
                onMouseLeave={row?.onMouseLeave}
                ref={row?.ref}
              >
                {row.notificationsNumber && row.notificationsNumber > 0 ? (
                  <td className="tableInf__notification">
                    <span className="tableInf__notificationText">
                      {row.notificationsNumber}
                    </span>
                  </td>
                ) : (
                  <></>
                )}
                {row.cols.filter(Boolean).map((rowCol, colIndex) =>
                  Array.isArray(rowCol.content) ? (
                    rowCol.content.map((rowColContent, i) =>
                      rowCol.href ? (
                        <Link
                          key={`${colIndex}${i}`}
                          href={rowCol.href}
                          className={classNames(
                            [
                              'table-col',
                              cols[colIndex].className,
                              rowCol.className,
                            ],
                            {
                              tableInf__infText: !rowCol.noWrapper,
                              tableInf__infText_noBg:
                                cols[colIndex].noBg || rowCol.noBg,
                              'font-size-large': rowCol.fontSize === 'large',
                              'table-col--border-highlighted':
                                i === Array(rowCol.content).length &&
                                (cols[colIndex].highlightBorder ||
                                  rowCol.highlightBorder),
                            },
                          )}
                          target={
                            rowCol.hrefTarget ||
                            cols[colIndex].hrefTarget ||
                            '_self'
                          }
                          style={{
                            width: cols[colIndex].width,
                            ...rowCol.style,
                          }}
                          onClick={rowCol.onClick}
                        >
                          {rowColContent}
                        </Link>
                      ) : (
                        <td
                          key={`${colIndex}${i}`}
                          className={classNames(
                            'table-col',
                            [cols[colIndex]?.className, rowCol.className],
                            {
                              tableInf__infText: !rowCol.noWrapper,
                              tableInf__infText_noBg:
                                cols[colIndex]?.noBg || rowCol.noBg,
                              'font-size-large': rowCol.fontSize === 'large',
                              'table-col--border-highlighted':
                                i === Array(rowCol.content).length &&
                                (cols[colIndex].highlightBorder ||
                                  rowCol.highlightBorder),
                            },
                          )}
                          style={{
                            width: rowCol?.width || cols[colIndex]?.width,
                            ...rowCol.style,
                          }}
                          onClick={rowCol.onClick}
                        >
                          {rowColContent}
                        </td>
                      ),
                    )
                  ) : rowCol.href ? (
                    <td
                      key={colIndex}
                      className={classNames(
                        [
                          'table-col',
                          cols[colIndex].className,
                          rowCol.className,
                        ],
                        {
                          tableInf__infText: !rowCol.noWrapper,
                          tableInf__infText_noBg:
                            cols[colIndex].noBg || rowCol.noBg,
                          'font-size-large': rowCol.fontSize === 'large',
                          'table-col--border-highlighted':
                            cols[colIndex].highlightBorder ||
                            rowCol.highlightBorder,
                        },
                      )}
                      style={{
                        width: cols[colIndex].width,
                        ...rowCol.style,
                      }}
                    >
                      <Link
                        className="color-black"
                        href={rowCol.href}
                        target={
                          rowCol.hrefTarget ||
                          cols[colIndex].hrefTarget ||
                          '_self'
                        }
                        onClick={rowCol.onClick}
                      >
                        {rowCol.content}
                      </Link>
                    </td>
                  ) : (
                    <td
                      key={colIndex}
                      className={classNames(
                        'table-col',
                        [cols[colIndex]?.className, rowCol.className],
                        {
                          tableInf__infText: !rowCol.noWrapper,
                          tableInf__infText_noBg:
                            cols[colIndex]?.noBg || rowCol.noBg,
                          'font-size-large': rowCol.fontSize === 'large',
                          'table-col--border-highlighted':
                            cols[colIndex]?.highlightBorder ||
                            rowCol.highlightBorder,
                        },
                      )}
                      style={{
                        width: rowCol?.width || cols[colIndex]?.width,
                        ...rowCol.style,
                      }}
                      onClick={rowCol.onClick}
                    >
                      {rowCol.content}
                    </td>
                  ),
                )}
              </tr>
              {!!row?.childContent && (
                <tr>
                  <td style={{ width: '100%' }}>{row.childContent}</td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
