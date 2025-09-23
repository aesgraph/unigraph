import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import {
  SongAnnotation,
  SongAnnotationDataArgs,
  SongAnnotationId,
} from "./SongAnnotation";

const songAnnotationDatas: SongAnnotationDataArgs[] = [
  {
    id: "sjrvdyrxl",
    time: 4.310415,
    text: ".",
    description: "",
    tags: [],
  },
  {
    id: "vxalht873",
    time: 7.515057,
    text: ".",
    description: "",
    tags: [],
  },
  {
    id: "ffooiklnz",
    time: 10.735086,
    text: ".",
    description: "",
    tags: [],
  },
  {
    id: "jmnpy40re",
    time: 13.91467,
    text: ".",
    description: "",
    tags: [],
  },
  {
    id: "t831akzsb",
    time: 17.072176,
    text: ".",
    description: "",
    tags: [],
  },
  {
    id: "tssc1i7df",
    time: 20.329084,
    text: ".",
    description: "",
    tags: [],
  },
  {
    id: "45mapcnvp",
    time: 23.501843,
    text: ".",
    description: "",
    tags: [],
  },
  {
    id: "vmotw3c8n",
    time: 26.689489,
    text: "0",
    description: "",
    tags: [],
  },
  {
    id: "pywa7wpso",
    time: 29.868519,
    text: "1",
    description: "",
    tags: [],
  },
  {
    id: "18sijbqzx",
    time: 33.080696,
    text: "2",
    description: "",
    tags: [],
  },
  {
    id: "8e7q2bydz",
    time: 36.434535,
    text: "4",
    description: "",
    tags: [],
  },
  {
    id: "imblkla0i",
    time: 39.503459,
    text: "0",
    description: "",
    tags: [],
  },
  {
    id: "hroseh69n",
    time: 42.727014,
    text: "1",
    description: "",
    tags: [],
  },
  {
    id: "mf7rlxmnj",
    time: 45.940163,
    text: "2",
    description: "",
    tags: [],
  },
  {
    id: "mhr0xner2",
    time: 48.695216,
    text: "3",
    description: "",
    tags: [],
  },
  {
    id: "eocrlcdjt",
    time: 52.282093,
    text: "4",
    description: "",
    tags: [],
  },
  {
    id: "ejv199d6o",
    time: 65.096515,
    text: "00",
    description: "",
    tags: [],
  },
];

export const demoSongAnnotations = new EntitiesContainer<
  SongAnnotationId,
  SongAnnotation
>();
for (const data of songAnnotationDatas) {
  const annotation = new SongAnnotation(data.id, data);
  demoSongAnnotations.addEntity(annotation);
}
