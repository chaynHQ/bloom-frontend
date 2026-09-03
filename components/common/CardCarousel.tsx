'use client';

import DirectionalIcon from '@/components/common/DirectionalIcon';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Box, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export interface SlidesPerView {
  xs: number;
  sm?: number;
  md?: number;
}

// Track padding, in theme spacing units, so the first card lines up with the section's text.
const EDGE = 3;

const slideWidth = (perView: number, gapPx: number) =>
  `calc((100% - ${(perView - 1) * gapPx}px) / ${perView})`;

const responsiveSlideWidth = (slidesPerView: SlidesPerView, gapPx: number) => {
  const { xs, sm, md } = slidesPerView;
  return {
    xs: slideWidth(xs, gapPx),
    ...(sm !== undefined && { sm: slideWidth(sm, gapPx) }),
    ...(md !== undefined && { md: slideWidth(md, gapPx) }),
  };
};

const trackStyle = (slidesPerView: SlidesPerView, gap: number) =>
  ({
    display: 'grid',
    gap,
    gridAutoFlow: 'column',
    gridAutoColumns: responsiveSlideWidth(slidesPerView, gap * 8),
    overflowX: 'auto',
    scrollSnapType: 'inline mandatory',
    marginInline: -EDGE,
    paddingInline: EDGE,
    scrollPaddingInlineStart: (theme: { spacing: (n: number) => string }) => theme.spacing(EDGE),
    paddingBlock: 1,
    marginBlock: -1,
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  }) as const;

const slideStyle = {
  scrollSnapAlign: 'start',
  display: 'flex',
  '& > *': { width: '100%' },
} as const;

const controlsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1.5,
  mt: 3,
} as const;

const arrowStyle = {
  width: 44,
  height: 44,
  backgroundColor: 'primary.dark',
  color: 'common.white',
  '&:hover': { backgroundColor: 'primary.dark', opacity: 0.85 },
  '&.Mui-disabled': { backgroundColor: 'primary.main', color: 'common.white' },
} as const;

const dotButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 44,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
} as const;

const dotStyle = (active: boolean) =>
  ({
    width: active ? 22 : 8,
    height: 8,
    borderRadius: '100px',
    backgroundColor: active ? 'primary.dark' : 'primary.main',
    transition: 'width 150ms ease, background-color 150ms ease',
  }) as const;

export function CardCarousel({
  children,
  label,
  eventName,
  eventData,
  slidesPerView = { xs: 1.12, sm: 2, md: 3 },
  gap = 2.5,
  controls = false,
  qaId,
}: {
  children: ReactNode[];
  label?: string;
  eventName: string;
  eventData?: Record<string, unknown>;
  slidesPerView?: SlidesPerView;
  gap?: number;
  controls?: boolean;
  qaId?: string;
}) {
  const tS = useTranslations('Shared.carousel');
  const name = label ?? tS('regionLabel');
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth || 1;
    const scrollLeft = Math.abs(track.scrollLeft);
    const maxScroll = track.scrollWidth - track.clientWidth;
    const pageCount = Math.max(1, Math.ceil(track.scrollWidth / width));
    const nextAtEnd = maxScroll > 0 && scrollLeft >= maxScroll - 1;
    setPages(pageCount);
    setPage(nextAtEnd ? pageCount - 1 : Math.round(scrollLeft / width));
    setAtStart(scrollLeft <= 1);
    setAtEnd(nextAtEnd);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', measure);
    };
  }, [measure, children.length]);

  const reportedPage = useRef(0);
  useEffect(() => {
    if (page === reportedPage.current) return;
    reportedPage.current = page;
    logEvent(eventName, {
      carousel_page: page + 1,
      carousel_pages: pages,
      ...eventData,
      ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // `scrollLeft` runs negative in RTL, so the step is signed by the reading direction.
  const goToPage = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const direction = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    track.scrollTo({ left: direction * next * track.clientWidth, behavior: 'smooth' });
  };

  const showControls = controls && pages > 1;

  return (
    <Box>
      <Box
        ref={trackRef}
        qa-id={qaId}
        role="region"
        aria-label={name}
        tabIndex={0}
        sx={trackStyle(slidesPerView, gap)}
      >
        {children.map((child, index) => (
          <Box key={index} sx={slideStyle}>
            {child}
          </Box>
        ))}
      </Box>

      {showControls && (
        <Box sx={controlsStyle}>
          <IconButton
            onClick={() => goToPage(page - 1)}
            disabled={atStart}
            aria-label={tS('previous', { name })}
            sx={arrowStyle}
          >
            <DirectionalIcon>
              <KeyboardArrowLeft />
            </DirectionalIcon>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {Array.from({ length: pages }, (_, index) => (
              <Box
                key={index}
                component="button"
                type="button"
                onClick={() => goToPage(index)}
                aria-label={tS('goToPage', { name, page: index + 1, pages })}
                aria-current={page === index}
                sx={dotButtonStyle}
              >
                <Box sx={dotStyle(page === index)} />
              </Box>
            ))}
          </Box>
          <IconButton
            onClick={() => goToPage(page + 1)}
            disabled={atEnd}
            aria-label={tS('next', { name })}
            sx={arrowStyle}
          >
            <DirectionalIcon>
              <KeyboardArrowRight />
            </DirectionalIcon>
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
