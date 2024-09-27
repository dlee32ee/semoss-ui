import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { override } from 'mobx';

interface CarouselProps {
    items: Array<{ title: string; content: string }>;
    itemsToShow?: number;
    setSelectedSubTaskApp: Function;
}

const Carousel: React.FC<CarouselProps> = ({
    items,
    itemsToShow = 4,
    setSelectedSubTaskApp,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const childrenRef = useRef<HTMLDivElement>(null);

    const CARD_WIDTH = 100; // px
    const CARD_MARGIN = 20; // px

    const handleNext = () => {
        setActiveIndex((prevIndex) => {
            const nextShift =
                (prevIndex + 1) % (items.length - itemsToShow + 1);
            const carouselWidth = carouselRef.current.offsetWidth;
            const childrenWidth = childrenRef.current.scrollWidth;
            console.log({
                nextShift,
                // carouselRef: carouselRef.current,
                // childrenRef: childrenRef.current,
                carouselWidth,
                childrenWidth,
            });
            return nextShift;
        });
    };

    const handlePrev = () => {
        setActiveIndex(
            (prevIndex) =>
                (prevIndex - 1 + items.length) %
                (items.length - itemsToShow + 1),
        );
    };

    const checkOverflow = () => {
        if (carouselRef.current && childrenRef.current) {
            const carouselWidth = carouselRef.current.offsetWidth;
            const childrenWidth = childrenRef.current.scrollWidth;
            setIsOverflowing(childrenWidth > carouselWidth);
        }
    };

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
        };
    }, [items]);

    return (
        <Box
            sx={{
                // width: '50%', // width is problematic at this level
                // maxWidth: "500px",
                // maxWidth: "100%",
                // margin: '0 auto',
                textAlign: 'center',
                border: '3px solid orange',
                overflow: 'hidden',
                // flex: 1,
            }}
        >
            <Box
                ref={carouselRef}
                sx={{
                    overFlow: 'hidden',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    height: 300,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '3px solid pink',
                    borderRadius: 2,
                    padding: 2,
                    // width: '100%',
                }}
            >
                <Box
                    ref={childrenRef}
                    sx={{
                        display: 'flex',
                        transform: `translate(-${
                            // (activeIndex * (CARD_WIDTH - Math.floor(CARD_MARGIN / 1))) / itemsToShow
                            // (activeIndex * (CARD_WIDTH + Math.floor(CARD_MARGIN / 4))) / itemsToShow
                            (activeIndex * CARD_WIDTH) / itemsToShow
                        }%)`,
                        transition: 'transform 0.5s ease',
                        // width: '100%',
                        border: '3px dashed red',
                    }}
                >
                    {items.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                flexShrink: 0,
                                width: `25%`, // play with this width
                                // width: `${CARD_WIDTH}px`,
                                border: '3px dotted blue',
                                marginLeft: `${Math.floor(CARD_MARGIN / 2)}`,
                                marginRight: `${Math.floor(CARD_MARGIN / 2)}`,
                            }}
                        >
                            <Typography variant="h4">{item.title} A</Typography>
                            <Typography>{item.content}</Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setSelectedSubTaskApp(index);
                                }}
                            >
                                Select
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Box>
            {isOverflowing && (
                <Box
                    sx={{
                        marginTop: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Button variant="contained" onClick={handlePrev}>
                        Prev
                    </Button>
                    <Button variant="contained" onClick={handleNext}>
                        Next
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default Carousel;
