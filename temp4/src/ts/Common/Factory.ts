namespace Minex.Common.Lib {
    export interface IFactory<TSpecification, TResult> {
        Construct(specification: TSpecification): TResult;
    }
}
