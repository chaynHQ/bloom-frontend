import { PartnerContent } from '@/constants/partners';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';
import { joinedPartners } from './formatPartnerAccesses';

const partnerAccessBase = {
  partner: {
    name: 'Bzzz',
  } as PartnerContent,
} as PartnerAccess;
const partnerAccess1 = {
  partner: {
    name: 'Moo',
  } as PartnerContent,
} as PartnerAccess;

const partnerAdmin = {
  partner: {
    name: 'Baa',
  } as PartnerContent,
} as PartnerAdmin;

describe('formatPartnerAccess', () => {
  it('When one partner access code, should return correctly ', () => {
    expect(joinedPartners([partnerAccessBase], undefined)).to.be('Bzzz');
  });
  it('When two partner access code, should return correctly ', () => {
    expect(joinedPartners([partnerAccessBase, partnerAccess1], undefined)).to.be('Bzzz, Moo');
  });
  it('When two partner access code, should return correctly in alphabetical order', () => {
    expect(joinedPartners([partnerAccess1, partnerAccessBase], undefined)).to.be('Bzzz, Moo');
  });
  it('When partner access code and partner admin supplied, should return correctly in alphabetical order', () => {
    expect(joinedPartners([partnerAccess1, partnerAccessBase], partnerAdmin)).to.be(
      'Baa, Bzzz, Moo',
    );
  });
  it('When partner admin supplied, should return correctly', () => {
    expect(joinedPartners([], partnerAdmin)).to.be('Baa');
  });
});
