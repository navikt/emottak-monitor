import React from 'react';
import usePagination, {DOTS, Param } from "./hooks/usePagination";
import styles from './Pagination.module.css';
import clsx from 'clsx'
import {Back, Next} from '@navikt/ds-icons'

type PaginationProps = Param&{
    onPageChange: (page: number) => void;
};

const Pagination = (props: PaginationProps) => {
    const {
        onPageChange,
        totalCount,
        siblingCount = 1,
        currentPage,
        pageSize,
    } = props;

    const handlePageChange = (page: number | string) => {
        onPageChange(typeof page === 'string' ? parseInt(page): page);
    }

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize
    });

    // If there are less than 2 times in pagination range we shall not render the component
    if (currentPage === 0 || paginationRange.length < 2) {
        return null;
    }

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    const isCurrentPage = (pageNumber: string|number) => {
        if (typeof pageNumber === 'string') {
            return parseInt(pageNumber) === currentPage
        }
        return pageNumber === currentPage
    }

    let lastPage = paginationRange[paginationRange.length - 1];
    return (
        <ul
            className={styles.paginationContainer}
        >
            {/* Left navigation arrow */}
            <li
                className={clsx(styles.paginationItem, {
                    [styles.disabled]: currentPage === 1
                })}
                onClick={onPrevious}
            >
                <Back />
            </li>
            {paginationRange.map(pageNumber => {

                // If the pageItem is a DOT, render the DOTS unicode character
                if (pageNumber === DOTS) {
                    return <li className={clsx(styles.paginationItem, styles.dots)}>&#8230;</li>;
                }

                // Render our Page Pills
                return (
                    <li
                        className={clsx(styles.paginationItem, {
                            [styles.selected]: isCurrentPage(pageNumber)
                        })}
                        onClick={() => handlePageChange(pageNumber)}
                    >
                        {pageNumber}
                    </li>
                );
            })}
            {/*  Right Navigation arrow */}
            <li
                className={clsx(styles.paginationItem, {
                    [styles.disabled]: isCurrentPage(lastPage)
                })}
                onClick={onNext}
            >
                <Next />
            </li>
        </ul>
    );
};

export default Pagination;