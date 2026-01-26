import SkeletonMessageCard from "./SkeletonMessageCard"

export default function SkeletonMessages() {
    return <>
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
    </>
}
