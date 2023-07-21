import React, { useEffect, useState } from 'react';
import { styled, Container } from '@semoss/ui';
import { SxProps } from '@mui/system';

const StyledPage = styled('div')(({ theme }) => ({
    height: '100%',
    width: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
}));

const StyledPageHeader = styled('div', {
    shouldForwardProp: (prop) => prop !== 'stuck',
})<{
    /** Track if the page header is stuck */
    stuck: boolean;
}>(({ theme, stuck }) => ({
    position: 'sticky',
    top: '-1px',
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    // Checkout user permissions, and the stacked avatars
    zIndex: 10,
    borderBottom: stuck ? `solid ${theme.palette.divider}` : 'none',
    // borderBottomWidth: '1px',
    // borderBottomStyle: 'solid',
    // borderBottomColor: theme.palette.divider,
    marginBottom: theme.spacing(2),
    // Set this in Theme
    backgroundColor: theme.palette.background.paper,
}));

export interface PageProps {
    /** Content to include in the header */
    header?: React.ReactNode;

    /** Content to include in the main section of the page */
    children: React.ReactNode;
    sx?: SxProps;
}

export const Page = (props: PageProps): JSX.Element => {
    const { header, children, sx } = props;

    const [stuck, setStuck] = useState(false);
    const [headerElement, setHeaderElement] = useState(null);

    // if the header element, is scrolled, set it as sticky
    useEffect(() => {
        if (!headerElement) {
            return;
        }

        const observer = new IntersectionObserver(
            ([e]) => {
                setStuck(e.intersectionRatio < 1);
            },
            { threshold: [1] },
        );
        observer.observe(headerElement);

        return () => {
            observer.unobserve(headerElement);
        };
    }, [headerElement]);

    return (
        <StyledPage>
            {header && (
                <StyledPageHeader
                    ref={(node) => setHeaderElement(node)}
                    stuck={stuck}
                >
                    <Container maxWidth="xl" sx={sx}>
                        {header}
                    </Container>
                </StyledPageHeader>
            )}
            <Container maxWidth="xl">{children}</Container>
        </StyledPage>
    );
};
