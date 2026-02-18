import client from './client';
import { uploadFile } from './client';

export const getReadiness = () =>
    client.get('/onboarding/readiness/');

export const getMasterTemplate = () =>
    client.get('/onboarding/master-template/', { responseType: 'blob' });

export const uploadMasterWorkbook = (file, onProgress) =>
    uploadFile('/onboarding/master-upload/', file, onProgress);

export const getClassSectionTemplate = () =>
    client.get('/onboarding/classes-sections/template/', { responseType: 'blob' });

export const uploadClassSections = (file, onProgress) =>
    uploadFile('/onboarding/classes-sections/upload/', file, onProgress);

export const getFeeStructureTemplate = () =>
    client.get('/onboarding/fee-structure/template/', { responseType: 'blob' });

export const uploadFeeStructure = (file, onProgress) =>
    uploadFile('/onboarding/fee-structure/upload/', file, onProgress);
