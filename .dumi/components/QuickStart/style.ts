import { styled } from 'styled-components';
import { Button, Typography } from 'antd';

export const SectionWrapper = styled.section`
  width: 100%;
  padding: 96px 240px;
  background: #001529;
  color: #fff;
`;

export const Container = styled.div`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 96px;
`;

export const SectionTitle = styled(Typography.Title)`
  && {
    font-size: 48px;
    font-weight: 600;
    margin: 0 0 16px 0;
    text-align: center;
    color: #fff !important;
  }
`;

export const SectionSubtitle = styled.div`
  font-size: 24px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 36px;
  text-align: center;
`;

export const TemplateGrid = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 48px;
  overflow-x: auto;
  padding-bottom: 16px;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

export const TemplateCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 24px;
  min-width: 384px;
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
  }
`;

export const TemplateImage = styled.div`
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
`;

export const TemplateTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
`;

export const TemplateDescription = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 22px;
`;

export const CTAButton = styled(Button)`
  margin-top: 48px;
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  border-radius: 24px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

export const MoreResourcesSection = styled.section`
  background: white;
  padding: 128px 24px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
`;

export const MoreResourcesTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
`;

export const MoreResourcesSubtitle = styled.p`
  color: #6b7280;
  margin-bottom: 32px;
  font-size: 16px;
`;

export const MoreResourcesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
  text-align: left;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const MoreResourcesCard = styled.div`
  height: 256px;
  background: #f9fafb;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f3f4f6;
`;

export const MoreResourcesCardIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
`;

export const MoreResourcesCardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Footer = styled.footer`
  background: #f9fafb;
  padding: 48px 240px;
  border-top: 1px solid #e5e7eb;
`;

export const FooterContainer = styled.div`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
`;

export const FooterColumns = styled.div`
  display: flex;
  justify-content: space-evenly;
  gap: 48px;
  margin-bottom: 48px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

export const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FooterColumnTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FooterColumnIcon = styled.img`
  width: 16px;
  height: 16px;
`;

export const FooterLinkList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const FooterLink = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`;

export const FooterLinkIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 4px;

  img {
    width: 16px;
    height: 16px;
  }
`;

export const FooterLinkText = styled.a`
  font-size: 14px;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #111827;
  }
`;

export const FooterLinkSeparator = styled.span`
  color: #6b7280;
  margin: 0 4px;
`;

export const FooterLinkDescription = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

export const FooterDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 48px 0;
`;

export const FooterText = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  text-align: center;
`;
