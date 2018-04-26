export class Tour {
    private readonly Steps: Array<() => void> = [];
    private Index: number = 0;


    public AddStep(step: () => void): void {
        this.Steps.push(step);
    }

    public InsertStep(step: () => void, index: number): void {
        this.Steps.splice(index, 0, step);
    }

    public NextStep(): void {
        if (this.Index < this.Steps.length) {
            let action = this.Steps[this.Index];
            action();

            this.Index++;
        }
        // Else, do nothing.
    }
}