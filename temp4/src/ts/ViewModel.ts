export class ViewModel {
    public static textToggle: boolean = true;


    public static toggleTextToggle() {
        ViewModel.textToggle = !ViewModel.textToggle;
    }
}