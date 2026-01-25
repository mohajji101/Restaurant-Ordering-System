import 'package:flutter/material.dart';
import '../utils/theme.dart';

class CategoryChip extends StatelessWidget {
  final String text;
  final bool selected;

  const CategoryChip(this.text, this.selected, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: AppSpacing.sm),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: selected ? AppColors.orangeGradient : null,
        color: selected ? null : AppColors.veryLightBlue,
        borderRadius: BorderRadius.circular(AppRadius.round),
        boxShadow: selected ? [AppShadows.sm] : null,
      ),
      alignment: Alignment.center,
      child: Text(
        text,
        style: TextStyle(
          color: selected ? AppColors.white : AppColors.primaryBlue,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }
}
