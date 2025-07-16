import { Group, Line, Rect } from "react-konva";

export const PageBackgroundGroupName = "PageBackgroundGroupName";
export const PageBreakName = "PageBreakName";

type PageBackgroundProps = {
  numberOfPages: number;
  pageHeight: number;
  pageWidth: number;
};

function PageBackground({
  numberOfPages,
  pageHeight,
  pageWidth,
}: PageBackgroundProps) {
  return (
    <>
      {[...Array(numberOfPages)].map((_, idx) => (
        <Group name={PageBackgroundGroupName} key={idx}>
          <Rect
            fill="white"
            y={pageHeight * idx}
            width={pageWidth}
            height={pageHeight}
          />
          {idx !== 0 && (
            <Line
              name={PageBreakName}
              points={[0, pageHeight * idx, pageWidth, pageHeight * idx]}
              strokeWidth={1}
              stroke="rgba(0, 0, 0, 0.4)"
              dash={[10, 5]}
            />
          )}
        </Group>
      ))}
    </>
  );
}

export default PageBackground;
