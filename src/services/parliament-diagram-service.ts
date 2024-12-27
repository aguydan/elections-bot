interface Group {
    color: string;
}

export class ParliamentDiagramService {
    private cache = new Map();

    public getSvg(data: Map<Group, number>, nSeats: number): string {
        const seatCenters = this.getSeatCenters(nSeats);
        //sorting points by their angles
        const seatCentersByGroup = this.distributeSeats(
            data,
            [...seatCenters.keys()].sort((a, b) => {
                return seatCenters.get(a)! - seatCenters.get(b)!;
            })
        );
        console.log(seatCentersByGroup);

        //         return getGroupedSvg();
    }

    public getGroupedSvg(
        seatCentersByGroup: Map<Group, [number, number][]>,
        options: { includeNumberOfSeats: boolean }
    ): string {}

    public distributeSeats(
        data: Map<Group, number>,
        seats: [number, number][]
    ): Map<Group, [number, number][]> {
        const groupCenters = new Map<Group, [number, number][]>();

        for (const [group, nSeats] of data) {
            groupCenters.set(group, [...seats.slice(0, nSeats)]);
            seats = seats.slice(nSeats);
        }

        if (seats.length) {
            console.warn('Too many seats were passed. ' + seats.length + ' are remaining');
        }

        return groupCenters;
    }

    public getSeatCenters(nSeats: number, spanAngle: number = 180): Map<[number, number], number> {
        const positions = new Map<[number, number], number>();

        const nRows = this.getNRowsFromNSeats(nSeats);
        const seatDiameter = this.getRowThickness(nRows);
        const maxedRows = this.getRowsFromNRows(nRows, spanAngle);

        const initialRow = 0;
        const fillRatio = nSeats / maxedRows.reduce((acc, nSeats) => acc + nSeats, 0);

        for (let i = initialRow; i < nRows; i++) {
            let nSeatsThisRow;

            if (i === nRows - 1) {
                nSeatsThisRow = nSeats - positions.size;
            } else {
                nSeatsThisRow = Math.round(fillRatio * maxedRows[i]!);
            }

            const rowArcRadius = 0.5 + 2 * seatDiameter * i;

            if (nSeatsThisRow === 1) {
                positions.set([1, rowArcRadius], Math.PI / 2);
            } else {
                const angleMargin = Math.asin(seatDiameter / rowArcRadius);
                const angleIncrement = (Math.PI - 2 * angleMargin) / (nSeatsThisRow - 1);

                for (let i = 0; i < nSeatsThisRow; i++) {
                    const angle = angleMargin + i * angleIncrement;

                    positions.set(
                        [rowArcRadius * Math.cos(angle) + 1, rowArcRadius * Math.sin(angle)],
                        angle
                    );
                }
            }
        }

        return positions;
    }

    public getNRowsFromNSeats(nSeats: number, spanAngle: number = 180): number {
        let i = 1;

        while (
            this.getRowsFromNRows(i, spanAngle).reduce((acc, nSeats) => acc + nSeats, 0) < nSeats
        ) {
            i++;
        }

        return i;
    }

    /**
     * Returns the maximum number of seats for each row from the given number of rows
     */
    public getRowsFromNRows(nRows: number, spanAngle: number = 180): number[] {
        const maxSeats = [];
        const seatDiameter = this.getRowThickness(nRows);

        const spanAngleInRadians = (Math.PI * spanAngle) / 180;

        for (let i = 0; i < nRows; i++) {
            //0.5 is the bottom of the half-annulus (parliament hemicycle).
            const rowArcRadius = 0.5 + 2 * seatDiameter * i;
            maxSeats.push(Math.trunc((spanAngleInRadians * rowArcRadius) / (2 * seatDiameter)));
        }

        return maxSeats;
    }

    /**
     * Returns row thickness in relation to the canvas height.
     * The canvas height is set to 1 and by default only includes
     * the upper half-disk of the original disk (circle) which radius is 1.
     *
     * @see https://github.com/Gouvernathor/parliamentarch/blob/main/src/parliamentarch/geometry.py
     */
    public getRowThickness(nRows: number): number {
        return 1 / (4 * (nRows - 0.5));
    }
}
